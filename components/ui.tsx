import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
export function Button({ className, variant="primary", size="md", asChild=false, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"secondary"|"ghost"; size?: "sm"|"md"; asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn("inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50", size==="sm" ? "px-3 py-2 text-xs" : "px-4 py-2.5", variant==="primary" ? "bg-navy text-white hover:bg-blue-900" : variant==="secondary" ? "border border-line bg-white text-ink hover:bg-slate-50" : "text-slate-600 hover:bg-slate-100", className)} {...props} />;
}
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("rounded-2xl border border-line bg-white shadow-soft", className)} {...props} />; }
export function Badge({ className, tone="neutral", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral"|"good"|"bad"|"blue" }) {
  const tones = { neutral:"bg-slate-100 text-slate-600", good:"bg-emerald-50 text-emerald-700", bad:"bg-rose-50 text-rose-700", blue:"bg-blue-50 text-blue-700" };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone], className)} {...props} />;
}