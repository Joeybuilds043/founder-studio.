import { NextResponse } from "next/server";
import { readWorkspaceFile, writeWorkspaceFile } from "@/lib/server";
import { runPython } from "@/lib/python";
export const runtime = "nodejs";
export async function GET() {
  const saved = await readWorkspaceFile("verdict.md");
  const verdict = saved.match(/verdict: (Profitable|Not yet|Incomplete)/i)?.[1] || "Incomplete";
  return NextResponse.json({ verdict, report: saved });
}
export async function POST() {
  try {
    const idea = await readWorkspaceFile("idea.md");
    const required = ["board.md", "competitors.md", "pricing.md", "offer.md", "cfo.md", "marketing.md", "brand.md", "ops.md", "launch.md"];
    const missing: string[] = [];
    if (!idea.trim()) missing.push("idea.md");
    for (const file of required) if (!(await readWorkspaceFile(file)).trim()) missing.push(file);
    if (!(await readWorkspaceFile("panel/results.md")).trim()) missing.push("panel/results.md");
    let compiler = "";
    let compilerVerdict = "Incomplete";
    try {
      const result = await runPython("compile.py", []);
      compiler = result.stdout + result.stderr;
      compilerVerdict = compiler.match(/Verdict: (Profitable|Not yet|Incomplete)/i)?.[1] || "Incomplete";
    } catch (error) { compiler = error instanceof Error ? error.message : "Compiler failed"; }
    const verdict = missing.length || compilerVerdict === "Incomplete" ? "Incomplete" : compilerVerdict;
    const note = missing.length
      ? "Required evidence is missing. The original compiler is more permissive about absent panel evidence; Founder Studio blocks a positive verdict until all core evidence is present."
      : compiler || "The original plan compiler completed.";
    const report = `# Founder Studio verdict: ${verdict}\n\n${note}\n\n## Missing evidence\n${missing.length ? missing.map((x) => "- " + x).join("\n") : "- None"}\n`;
    await writeWorkspaceFile("verdict.md", report);
    return NextResponse.json({ verdict, missing, compiler: note, report });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to compile plan." }, { status: 500 });
  }
}