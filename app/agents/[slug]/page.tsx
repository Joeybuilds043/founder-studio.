import { notFound } from "next/navigation";
import { agentFor } from "@/lib/agents";
import { AgentWorkbench } from "@/components/agent-workbench";
export default async function AgentPage({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params;
  const agent = agentFor(slug);
  if (!agent) notFound();
  return <AgentWorkbench agent={agent}/>;
}