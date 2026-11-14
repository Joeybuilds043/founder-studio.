"use client";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowRight, Bot, Calculator, CheckCircle2, Clock3, Loader2, Play, ShieldAlert, Users } from "lucide-react";
import Link from "next/link";
import { Button, Badge, Card } from "@/components/ui";
import { agents } from "@/lib/agents";
type Agent = typeof agents[number];
const defaultCustomer = {
  business:"A new consumer business", target:"Urban adults who experience this problem regularly",
  segments:[{name:"Core buyers",income:[30000,90000],share:0.7},{name:"Price-sensitive buyers",income:[15000,45000],share:0.3}],
  behaviours:[{name:"Problem-aware",share:0.6,how:"Already uses an imperfect workaround"},{name:"Convenience-led",share:0.4,how:"Values saved time"}],
  objections:["Price is too high","Not sure I trust a new provider","I already use an alternative"], age:[22,45], habits:["Compares alternatives before purchase","Asks friends for recommendations"]
};
export function AgentWorkbench({agent}:{agent:Agent}) {
  const [input,setInput]=useState(agent.slug==="consumer"?"Describe the customer, current alternatives, buying trigger, and the exact pitch you want tested.": "");
  const [idea,setIdea]=useState("");
  const [result,setResult]=useState("");
  const [savedFile,setSavedFile]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [mode,setMode]=useState<"quick"|"full">("quick");
  const [customerJson,setCustomerJson]=useState(JSON.stringify(defaultCustomer,null,2));
  const count=mode==="quick"?20:100;
  
  async function runAgent() {
    setError("");setResult("");setBusy(true);
    try {
      const r=await fetch(`/api/agent/${agent.slug}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({input,idea:idea||undefined})});
      const raw=await r.text();let data:any;try{data=raw?JSON.parse(raw):null;}catch{throw new Error(raw.trim().startsWith("<")?`App server returned an HTML error (HTTP ${r.status}). Restart the Codespace and check the server logs.`:`App server returned an empty or invalid response (HTTP ${r.status}).`);}if(!r.ok)throw new Error(data?.error||`Agent request failed (HTTP ${r.status})`);if(!data)throw new Error("App server returned an empty response.");
      setResult(data.result);setSavedFile(data.file);localStorage.setItem(`founder-done-${agent.slug}`,"1");
    } catch(e) {setError(e instanceof Error?e.message:"Unexpected error");} finally {setBusy(false);}
  }
  async function runPanel() {
    setError("");setResult("");setBusy(true);
    try {
      const customer=JSON.parse(customerJson);
      const r=await fetch("/api/panel",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer,pitch:input,count})});
      const raw=await r.text();let data:any;try{data=raw?JSON.parse(raw):null;}catch{throw new Error(raw.trim().startsWith("<")?`App server returned an HTML error (HTTP ${r.status}). Restart the Codespace and check the server logs.`:`App server returned an empty or invalid response (HTTP ${r.status}).`);}if(!r.ok)throw new Error(data?.error||`Panel run failed (HTTP ${r.status})`);if(!data)throw new Error("App server returned an empty response.");
      setResult(data.results);setSavedFile("panel/results.md");localStorage.setItem("founder-done-consumer","1");
    } catch(e) {setError(e instanceof Error?e.message:"Check the customer JSON");} finally {setBusy(false);}
  }
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="mb-2 flex items-center gap-2"><Badge tone="blue">Agent {String(agents.findIndex(a=>a.slug===agent.slug)+1).padStart(2,"0")} / 11</Badge><Badge>{agent.role}</Badge></div><h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{agent.description}</p></div><Button variant="secondary" asChild><Link href="/"><ArrowLeft size={15}/> Dashboard</Link></Button></div>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <Card className="p-5 md:p-6"><div className="mb-5 flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-navy"><Bot size={18}/></div><div><h2 className="font-bold">Agent brief</h2><p className="text-xs text-slate-500">Inputs are sent to the server, not the browser API key.</p></div></div>
        {agent.slug!=="board"&&<div className="mb-4"><label className="mb-2 block text-xs font-semibold text-slate-600">Business idea context <span className="font-normal text-slate-400">(optional if already saved)</span></label><textarea value={idea} onChange={e=>setIdea(e.target.value)} rows={3} placeholder="What are you building, for whom, and why?" className="w-full resize-y rounded-xl border border-line bg-slate-50 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/></div>}
        {agent.slug==="consumer"?<><div className="mb-4"><label className="mb-2 block text-xs font-semibold text-slate-600">Buyer pitch</label><textarea value={input} onChange={e=>setInput(e.target.value)} rows={5} placeholder="Describe what you sell, the price, and where." className="w-full rounded-xl border border-line bg-slate-50 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/></div><div className="mb-4"><label className="mb-2 block text-xs font-semibold text-slate-600">Customer profile JSON</label><textarea value={customerJson} onChange={e=>setCustomerJson(e.target.value)} rows={10} spellCheck={false} className="w-full rounded-xl border border-line bg-slate-50 p-3 font-mono text-xs leading-5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/></div><div className="rounded-xl border border-line p-4"><div className="flex items-center gap-2 text-sm font-semibold"><Users size={16}/> Synthetic buyer panel</div><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={()=>setMode("quick")} className={`rounded-lg border p-3 text-left ${mode==="quick"?"border-blue-500 bg-blue-50":"border-line"}`}><div className="text-sm font-bold">Quick mode</div><div className="mt-1 text-xs text-slate-500">20 synthetic buyers</div></button><button onClick={()=>setMode("full")} className={`rounded-lg border p-3 text-left ${mode==="full"?"border-blue-500 bg-blue-50":"border-line"}`}><div className="text-sm font-bold">Full mode</div><div className="mt-1 text-xs text-slate-500">100 synthetic buyers</div></button></div><div className="mt-3 flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-3"><div><div className="text-xs font-semibold text-slate-600">Model usage</div><div className="mt-1 text-lg font-bold text-ink">{count} buyer calls</div><div className="mt-1 text-[10px] leading-4 text-slate-400">Quick mode is recommended. Full mode can hit free-model rate limits and may need a retry.</div></div><Calculator className="mt-1 text-slate-400" size={18}/></div></div><div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800"><ShieldAlert size={16} className="mt-0.5 shrink-0"/>These are AI-generated synthetic responses, not interviews, surveys, or evidence of real customer demand.</div></>:<><div className="mb-4"><label className="mb-2 block text-xs font-semibold text-slate-600">{agent.slug==="board"?"Business idea and founder context":"Instructions and evidence for this agent"}</label><textarea value={input} onChange={e=>setInput(e.target.value)} rows={agent.slug==="board"?13:16} placeholder={agent.slug==="board"?"Describe the business, customer, problem, solution, geography, price assumptions, and what you have validated so far.":"Add assumptions, findings, documents, constraints and specific questions for this agent."} className="w-full resize-y rounded-xl border border-line bg-slate-50 p-3 text-sm leading-6 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/></div></>}
        <Button className="w-full" disabled={busy||input.trim().length<10} onClick={agent.slug==="consumer"?runPanel:runAgent}>{busy?<><Loader2 className="animate-spin" size={16}/> Running agent…</>:<><Play size={15}/>{agent.slug==="consumer"?`Run ${count}-buyer panel`:"Run "+agent.name+" agent"}<ArrowRight size={15}/></>}</Button>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400"><Clock3 size={12}/> Outputs are saved in the server-side founder/ workspace.</p>
      </Card>
      <Card className="min-h-[560px] p-5 md:p-6"><div className="flex items-center justify-between border-b border-line pb-4"><div><h2 className="font-bold">Agent output</h2><p className="mt-1 text-xs text-slate-500">{savedFile? `Saved to founder/${savedFile}`:"Results appear here after a run."}</p></div>{result&&<Badge tone="good"><CheckCircle2 size={12} className="mr-1"/> Saved</Badge>}</div>{busy?<div className="flex h-[430px] flex-col items-center justify-center text-center"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-navy"><Loader2 className="animate-spin" size={25}/></div><p className="mt-4 font-semibold">Working through the evidence</p><p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">The server is applying the original skill instructions. Board runs three independent lens assessments; the consumer panel runs one model call per synthetic buyer.</p><div className="mt-6 h-1.5 w-56 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-1/2 animate-pulse rounded-full bg-navy"/></div></div>:error?<div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>:result?<article className="prose-output max-h-[700px] overflow-y-auto pt-4 text-sm"><ReactMarkdown>{result}</ReactMarkdown></article>:<div className="flex h-[430px] flex-col items-center justify-center text-center"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Bot size={24}/></div><p className="mt-4 font-semibold text-slate-700">No output yet</p><p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">Complete the brief and run this agent. Results and files will appear in this panel.</p></div>}</Card>
    </div>
  </div>;
}