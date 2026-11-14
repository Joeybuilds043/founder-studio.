import { NextResponse } from "next/server";
import { ensureWorkspace, readAllOutputs, readWorkspaceFile, workspaceFiles } from "@/lib/server";
import { runPython } from "@/lib/python";
export const runtime = "nodejs";
export async function GET() {
  await ensureWorkspace();
  const files = await workspaceFiles();
  const idea = await readWorkspaceFile("idea.md");
  const outputs = await readAllOutputs();
  let economics: Record<string, unknown> | null = null;
  if (files.includes("numbers.json")) {
    try { const result = await runPython("unit_economics.py", ["--json"]); economics = JSON.parse(result.stdout); } catch { economics = null; }
  }
  let pricing: Record<string, unknown> | null = null;
  try { pricing = JSON.parse(await readWorkspaceFile("pricing-curve.json")); } catch { pricing = null; }
  return NextResponse.json({ idea, files, outputs, economics, pricing });
}