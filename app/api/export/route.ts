import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { readWorkspaceFile, readAllOutputs } from "@/lib/server";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const format = new URL(request.url).searchParams.get("format") || "md";
  const outputs = await readAllOutputs();
  const idea = await readWorkspaceFile("idea.md");
  const sections = outputs.filter((x) => x.content.trim()).map((x) => `## ${x.slug.toUpperCase()}\n\n${x.content}`);
  const markdown = `# Founder Studio — Business Plan\n\n## Idea\n\n${idea}\n\n${sections.join("\n\n---\n\n")}\n`;
  if (format !== "pdf") return new Response(markdown, { headers: { "Content-Type": "text/markdown; charset=utf-8", "Content-Disposition": 'attachment; filename="founder-business-plan.md"' } });
  const doc = new PDFDocument({ margin: 54, size: "A4" });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));
  doc.fontSize(20).text("Founder Studio — Business Plan");
  doc.moveDown().fontSize(10).text(markdown.replace(/^#.*$/gm, "").replace(/\*\*/g, "").replace(/\*/g, ""));
  doc.end();
  const pdf = await finished;
  return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="founder-business-plan.pdf"' } });
}