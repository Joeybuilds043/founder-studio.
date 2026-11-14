import { NextResponse } from "next/server";
import { z } from "zod";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { runPython } from "@/lib/python";
import { FOUNDER_DIR, readSkill, writeWorkspaceFile } from "@/lib/server";
import { getAIConfig } from "@/lib/ai-config";
export const runtime = "nodejs";
const schema = z.object({
  customer: z.object({ business: z.string(), target: z.string(), segments: z.array(z.object({ name: z.string(), income: z.array(z.number()).length(2), share: z.number().optional() })).min(1), behaviours: z.array(z.object({ name: z.string(), share: z.number().optional(), how: z.string().optional() })).min(1), objections: z.array(z.string()).min(1), age: z.array(z.number()).optional(), habits: z.array(z.string()).optional() }),
  pitch: z.string().min(10).max(8000), count: z.number().int().min(5).max(100)
});
async function buyerCall(api: { apiKey: string; baseURL: string; model: string }, brief: string) {
  const response = await fetch(`${api.baseURL}chat/completions`, {
    method: "POST", headers: { Authorization: `Bearer ${api.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: api.model, temperature: 0.7, response_format: { type: "json_object" }, messages: [
      { role: "system", content: "You are a synthetic customer persona. Answer only as the persona in the supplied brief. Do not be polite or agreeable by default. Return JSON with buys (boolean), reason_code (price, habit, need, trust, quality, convenience, timing, values, other), reason (string), and optional numeric price_too_cheap, price_cheap, price_expensive, price_too_expensive in the stated currency. Include all four price fields only if the product and currency are clear; otherwise return null for them. These are synthetic responses, not real interviews." },
      { role: "user", content: brief }
    ] })
  });
  const raw = await response.text();
  let data: any;
  try { data = raw ? JSON.parse(raw) : null; } catch {
    throw new Error(`AI provider returned an invalid or empty response (HTTP ${response.status}).`);
  }
  if (!response.ok) throw new Error(data?.error?.message || `Buyer model call failed (HTTP ${response.status}).`);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("AI provider returned an empty buyer response.");
  try { return JSON.parse(content); } catch {
    throw new Error("AI provider returned buyer data that was not valid JSON. Try again or use a different free model.");
  }
}
export async function POST(request: Request) {
  try {
    const { customer, pitch, count } = schema.parse(await request.json());
    const ai = getAIConfig();
    if (!ai.apiKey) return NextResponse.json({ error: `${ai.provider.toUpperCase()} API key is missing on the server.` }, { status: 503 });
    await writeWorkspaceFile("customer.json", JSON.stringify(customer, null, 2));
    await writeWorkspaceFile("pitch.md", pitch);
    await runPython("panel.py", ["init", "--customer", "founder/customer.json", "--pitch", "founder/pitch.md", "--n", String(count), "--seed", "7"]);
    await runPython("panel.py", ["prompts", "--wave", String(count)]);
    const panelDir = path.join(FOUNDER_DIR, "panel");
    const personas = JSON.parse(await readFile(path.join(panelDir, "personas.json"), "utf8")) as Array<{id:string}>;
    const skill = await readSkill("consumer");
    const concurrency = Math.max(1, Math.min(8, Number(process.env.PANEL_CONCURRENCY || 4)));
    let cursor = 0;
    const errors: string[] = [];
    const worker = async () => {
      while (cursor < personas.length) {
        const index = cursor++;
        const persona = personas[index];
        try {
          const brief = await readFile(path.join(panelDir, "briefs", `${persona.id}.md`), "utf8");
          const answer = await buyerCall(ai, `Original consumer research skill:\n${skill}\n\nBuyer brief:\n${brief}`);
          const codes = ["price","habit","need","trust","quality","convenience","timing","values","other"];
          const price = (v: unknown) => typeof v === "number" && Number.isFinite(v) ? v : null;
          const normalized = { id: persona.id, buys: Boolean(answer.buys), reason_code: codes.includes(answer.reason_code) ? answer.reason_code : "other", reason: String(answer.reason || "").slice(0, 1200), price_too_cheap: price(answer.price_too_cheap), price_cheap: price(answer.price_cheap), price_expensive: price(answer.price_expensive), price_too_expensive: price(answer.price_too_expensive) };
          await writeWorkspaceFile(`panel/answers/${persona.id}.json`, JSON.stringify(normalized, null, 2));
        } catch (error) { errors.push(`${persona.id}: ${error instanceof Error ? error.message : "failed"}`); }
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, personas.length) }, worker));
    const check = await runPython("panel.py", ["check"]);
    if (errors.length) return NextResponse.json({ error: "Some synthetic buyers failed.", errors, check: check.stdout }, { status: 502 });
    const tally = await runPython("panel.py", ["tally"]);
    const results = await readFile(path.join(panelDir, "results.md"), "utf8");
    await writeWorkspaceFile("panel/results.md", results);
    let pricing = "";
    try { const curveJson = await runPython("van_westendorp.py", ["founder/panel/answers", "--json"]); await writeWorkspaceFile("pricing-curve.json", curveJson.stdout); const priceResult = await runPython("van_westendorp.py", ["founder/panel/answers", "--out", "founder/pricing-curve.md"]); pricing = priceResult.stdout; } catch { pricing = "Not enough complete price responses for Van Westendorp analysis (at least five are required)."; }
    return NextResponse.json({ count: personas.length, concurrency, tally: tally.stdout, results, pricing, synthetic: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Panel run failed." }, { status: 400 });
  }
}