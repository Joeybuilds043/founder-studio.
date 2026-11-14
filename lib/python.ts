import "server-only";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
const exec = promisify(execFile);
export async function runPython(script: string, args: string[] = []) {
  const allowed = ["unit_economics.py", "panel.py", "van_westendorp.py", "compile.py"];
  if (!allowed.includes(path.basename(script))) throw new Error("Python script is not allow-listed");
  const fullPath = path.join(process.cwd(), "skills", script === "unit_economics.py" ? "founder-cfo" : script === "panel.py" ? "founder-consumer" : script === "van_westendorp.py" ? "founder-pricing" : "founder-plan", script);
  const { stdout, stderr } = await exec(process.env.PYTHON_BIN || "python3", [fullPath, ...args], { cwd: process.cwd(), timeout: 120000, maxBuffer: 4 * 1024 * 1024 });
  return { stdout, stderr };
}