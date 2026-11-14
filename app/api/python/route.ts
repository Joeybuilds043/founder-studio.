import { NextResponse } from "next/server";
import { z } from "zod";
import { runPython } from "@/lib/python";
import { writeWorkspaceFile } from "@/lib/server";
export const runtime = "nodejs";
const schema = z.object({ numbers: z.record(z.string(), z.unknown()) });
export async function POST(request: Request) {
  try {
    const { numbers } = schema.parse(await request.json());
    await writeWorkspaceFile("numbers.json", JSON.stringify(numbers, null, 2));
    const result = await runPython("unit_economics.py", ["--json"]);
    return NextResponse.json({ output: result.stdout, stderr: result.stderr, metrics: JSON.parse(result.stdout) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Python calculation failed." }, { status: 400 });
  }
}