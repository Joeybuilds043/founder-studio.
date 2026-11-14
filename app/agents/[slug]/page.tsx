import { notFound } from "next/navigation";
import { agentFor } from "@/lib/agents";
import { AgentWorkbench } from "@/components/agent-workbench";
import { PlanWorkbench } from "@/components/plan-workbench";
export default async function AgentPage({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params;
  const agent = agentFor(slug);
  if (!agent) notFound();
  if (slug === "plan") return <PlanWorkbench agent={agent}/>;
  return <AgentWorkbench agent={agent}/>;
}