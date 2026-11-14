import { NextResponse } from "next/server";
import { z } from "zod";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { runPython } from "@/lib/python";
import { FOUNDER_DIR, readSkill, readWorkspaceFile, writeWorkspaceFile } from "@/lib/server";
import { getAIConfig } from "@/lib/ai-config";
import { completeChat } from "@/lib/ai-completion";
export const runtime = "nodejs";
const schema = z.object({
  customer: z.object({ business: z.string(), target: z.string(), segments: z.array(z.object({ name: z.string(), income: z.array(z.number()).length(2), share: z.number().optional() })).min(1), behaviours: z.array(z.object({ name: z.string(), share: z.number().optional(), how: z.string().optional() })).min(1), objections: z.array(z.string()).min(1), age: z.array(z.number()).optional(), habits: z.array(z.string()).optional() }),
  pitch: z.string().min(10).max(8000), count: z.number().int().min(5).max(100)
});
async function buyerCall(api: { apiKey: string; baseURL: string; model: string }, brief: string) {
  const completion = await completeChat({
    apiKey: api.apiKey, baseURL: api.baseURL, model: api.model,
    temperature: 0.7, maxTokens: 900,
    system: "You are a synthetic customer persona. Answer only as the persona in the supplied brief. Do not be polite or agreeable by default. Return one valid JSON object only with id, buys (boolean), purchases_first_month (integer, 0 if not buying), reason_code (price, habit, need, trust, quality, convenience, timing, values, other), reason (string in the buyer's own voice), objection (main doubt in the buyer's own words), would_change_my_mind (one factor that could change the decision, or empty string), and optional numeric price_too_cheap, price_cheap, price_expensive, price_too_expensive in the stated currency. Include all four price fields only if the product and currency are clear; otherwise return null for them. These are synthetic responses, not real interviews.",
    user: brief
  });
  const content = completion.text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  try { return JSON.parse(content); } catch {
    const first = content.indexOf("{");
    const last = content.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try { return JSON.parse(content.slice(first, last + 1)); } catch { /* handled below */ }
    }
    throw new Error(`AI model ${completion.model} returned buyer data that was not valid JSON.`);
  }
}
async function executePanel(body: z.infer<typeof schema>, updateProgress: (message: string) => Promise<void>) {
  try {
    const { customer, pitch, count } = body;
    await updateProgress("Preparing synthetic buyer profiles");
    const ai = getAIConfig();
    if (!ai.apiKey) throw new Error(`${ai.provider.toUpperCase()} API key is missing on the server.`);
    await writeWorkspaceFile("customer.json", JSON.stringify(customer, null, 2));
    await writeWorkspaceFile("pitch.md", pitch);
    await runPython("panel.py", ["init", "--customer", "founder/customer.json", "--pitch", "founder/pitch.md", "--n", String(count), "--seed", "7"]);
    await runPython("panel.py", ["prompts", "--wave", String(count)]);
    const panelDir = path.join(FOUNDER_DIR, "panel");
    const personas = JSON.parse(await readFile(path.join(panelDir, "personas.json"), "utf8")) as Array<{id:string}>;
    const skill = await readSkill("consumer");
    const waveSize = Math.max(1, Math.min(10, Number(process.env.PANEL_CONCURRENCY || 10)));
    const errors: string[] = [];
    const codes = ["price","habit","need","trust","quality","convenience","timing","values","other"];
    const price = (v: unknown) => typeof v === "number" && Number.isFinite(v) ? v : null;
    let completed = 0;
    for (let offset = 0; offset < personas.length; offset += waveSize) {
      const wave = personas.slice(offset, offset + waveSize);
      await Promise.all(wave.map(async (persona) => {
        try {
          const brief = await readFile(path.join(panelDir, "briefs", `${persona.id}.md`), "utf8");
          const answer = await buyerCall(ai, `Original consumer research skill:\n${skill}\n\nBuyer brief:\n${brief}`);
          const normalized = {
            id: persona.id,
            buys: Boolean(answer.buys),
            purchases_first_month: Math.max(0, Math.min(100, Math.floor(Number(answer.purchases_first_month) || 0))),
            reason_code: codes.includes(answer.reason_code) ? answer.reason_code : "other",
            reason: String(answer.reason || "").slice(0, 1200),
            objection: String(answer.objection || "").slice(0, 800),
            would_change_my_mind: String(answer.would_change_my_mind || "").slice(0, 800),
            price_too_cheap: price(answer.price_too_cheap),
            price_cheap: price(answer.price_cheap),
            price_expensive: price(answer.price_expensive),
            price_too_expensive: price(answer.price_too_expensive)
          };
          await writeWorkspaceFile(`panel/answers/${persona.id}.json`, JSON.stringify(normalized, null, 2));
        } catch (error) { errors.push(`${persona.id}: ${error instanceof Error ? error.message : "failed"}`); }
      }));
      completed += wave.length;
      await updateProgress(`Collected ${completed} of ${personas.length} synthetic buyer responses`);
    }
    const check = await runPython("panel.py", ["check"]);
    if (errors.length) throw new Error(`Some synthetic buyers failed: ${errors.slice(0, 5).join("; ")}. ${check.stdout}`);
    await updateProgress("Calculating buyer demand and price sensitivity");
    const tally = await runPython("panel.py", ["tally"]);
    const results = await readFile(path.join(panelDir, "results.md"), "utf8");
    await writeWorkspaceFile("panel/results.md", results);
    let pricing = "";
    try { const curveJson = await runPython("van_westendorp.py", ["founder/panel/answers", "--json"]); await writeWorkspaceFile("pricing-curve.json", curveJson.stdout); const priceResult = await runPython("van_westendorp.py", ["founder/panel/answers", "--out", "founder/pricing-curve.md"]); pricing = priceResult.stdout; } catch { pricing = "Not enough complete price responses for Van Westendorp analysis (at least five are required)."; }
    return { count: personas.length, concurrency: waveSize, tally: tally.stdout, results, pricing, synthetic: true };
  } catch (error) {
    throw error;
  }
}

type PanelJob = { id: string; status: "queued" | "running" | "completed" | "failed"; progress: string; createdAt: string; updatedAt: string; result?: any; error?: string };
const JOB_ID = /^[0-9a-f-]{36}$/i;
async function persistJob(job: PanelJob) {
  job.updatedAt = new Date().toISOString();
  await writeWorkspaceFile(`jobs/${job.id}.json`, JSON.stringify(job, null, 2));
}

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    if (!getAIConfig().apiKey) return NextResponse.json({ error: "AI API key is missing on the server." }, { status: 503 });
    const id = randomUUID();
    const now = new Date().toISOString();
    const job: PanelJob = { id, status: "queued", progress: "Queued for processing", createdAt: now, updatedAt: now };
    await persistJob(job);
    void (async () => {
      try {
        job.status = "running";
        job.progress = "Starting synthetic buyer panel";
        await persistJob(job);
        job.result = await executePanel(body, async (progress) => {
          job.progress = progress;
          await persistJob(job);
        });
        job.status = "completed";
        job.progress = "Complete";
        await persistJob(job);
      } catch (error) {
        job.status = "failed";
        job.error = error instanceof Error ? error.message : "Panel run failed.";
        job.progress = "Failed";
        await persistJob(job);
      }
    })();
    return NextResponse.json({ jobId: id, status: job.status }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid panel request." }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("jobId") || "";
  if (!JOB_ID.test(id)) return NextResponse.json({ error: "A valid jobId is required." }, { status: 400 });
  const raw = await readWorkspaceFile(`jobs/${id}.json`);
  if (!raw) return NextResponse.json({ error: "Job not found. It may have expired or the server restarted." }, { status: 404 });
  try {
    const job = JSON.parse(raw) as PanelJob;
    const age = Date.now() - new Date(job.updatedAt).getTime();
    if ((job.status === "running" || job.status === "queued") && age > 20 * 60 * 1000) {
      return NextResponse.json({ ...job, status: "failed", error: "This panel stopped making progress. Start it again." });
    }
    return NextResponse.json(job);
  } catch {
    return NextResponse.json({ error: "Panel status could not be read." }, { status: 500 });
  }
}