import "server-only";
import path from "node:path";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { agents, type AgentSlug, outputFiles } from "@/lib/agents";
export const ROOT = process.cwd();
export const FOUNDER_DIR = path.join(ROOT, "founder");
export async function ensureWorkspace() { await mkdir(FOUNDER_DIR, { recursive: true }); }
export function safeSlug(value: string): value is AgentSlug { return agents.some((a) => a.slug === value); }
export async function readSkill(slug: AgentSlug) {
  return readFile(path.join(ROOT, "skills", `founder-${slug}`, "SKILL.md"), "utf8");
}
export async function writeWorkspaceFile(relative: string, content: string) {
  const target = path.resolve(FOUNDER_DIR, relative);
  if (!target.startsWith(FOUNDER_DIR + path.sep)) throw new Error("Invalid workspace path");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
}
export async function readWorkspaceFile(relative: string) {
  try { return await readFile(path.join(FOUNDER_DIR, relative), "utf8"); } catch { return ""; }
}
export async function workspaceFiles() {
  await ensureWorkspace();
  const walk = async (dir: string): Promise<string[]> => {
    const entries = await readdir(dir, { withFileTypes: true });
    const nested = await Promise.all(entries.map((entry) => entry.isDirectory()
      ? walk(path.join(dir, entry.name))
      : Promise.resolve([path.relative(FOUNDER_DIR, path.join(dir, entry.name))])));
    return nested.flat();
  };
  return walk(FOUNDER_DIR);
}
export async function saveAgentResult(slug: AgentSlug, content: string) {
  const target = outputFiles[slug];
  await writeWorkspaceFile(target, content);
  return target;
}
export async function readAllOutputs() {
  const files = await Promise.all(agents.map(async (agent) => ({
    slug: agent.slug, file: outputFiles[agent.slug], content: await readWorkspaceFile(outputFiles[agent.slug])
  })));
  return files;
}