export const agents = [
  { slug: "board", name: "Board", role: "Strategic challenge", description: "Pressure-test the idea through an investor and operator lens." },
  { slug: "competitors", name: "Competitors", role: "Market map", description: "Identify alternatives, positioning gaps and defensibility." },
  { slug: "consumer", name: "Consumer", role: "Buyer research", description: "Test the pitch against clearly labelled synthetic buyer personas." },
  { slug: "pricing", name: "Pricing", role: "Willingness to pay", description: "Estimate an acceptable price range from buyer price responses." },
  { slug: "offer", name: "Offer", role: "Offer design", description: "Turn the proposition into a specific, testable offer." },
  { slug: "cfo", name: "CFO", role: "Unit economics", description: "Calculate contribution, break-even, cash needs and year-one economics." },
  { slug: "marketing", name: "Marketing", role: "Go-to-market", description: "Define acquisition channels, messaging and measurable experiments." },
  { slug: "brand", name: "Brand", role: "Positioning", description: "Build a distinctive and credible brand system." },
  { slug: "ops", name: "Ops", role: "Operating model", description: "Map delivery, capacity, risks and operating requirements." },
  { slug: "launch", name: "Launch", role: "Execution plan", description: "Sequence validation and launch milestones." },
  { slug: "plan", name: "Plan", role: "Final decision", description: "Compile evidence and return a transparent business verdict." }
] as const;
export type AgentSlug = typeof agents[number]["slug"];
export const agentFor = (slug: string) => agents.find((agent) => agent.slug === slug);
export const outputFiles: Record<AgentSlug, string> = {
  board: "board.md", competitors: "competitors.md", consumer: "panel/results.md",
  pricing: "pricing.md", offer: "offer.md", cfo: "cfo.md", marketing: "marketing.md",
  brand: "brand.md", ops: "ops.md", launch: "launch.md", plan: "business-plan.md"
};