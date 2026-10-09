import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function LearningPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-9", className)}>{children}</div>;
}

export function PageHeading({ eyebrow, title, description, backHref, hideBackOnMobile, action }: {
  eyebrow?: string; title: string; description?: string; backHref?: string; hideBackOnMobile?: boolean; action?: ReactNode;
}) {
  return <header className="mb-6 sm:mb-8">
    {backHref && <Link href={backHref} className={cn("mb-4 min-h-9 items-center gap-1 rounded-lg pr-3 text-sm font-medium text-muted-foreground hover:text-foreground", hideBackOnMobile ? "hidden md:inline-flex" : "inline-flex")}><ChevronLeft className="size-4" /> Back</Link>}
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">{eyebrow}</p>}
        <h1 className="text-[1.65rem] font-bold leading-tight tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  </header>;
}

export function SectionHeading({ title, description, href, linkLabel }: {
  title: string; description?: string; href?: string; linkLabel?: string;
}) {
  return <div className="mb-3 flex items-end justify-between gap-3">
    <div><h2 className="text-base font-bold tracking-tight sm:text-lg">{title}</h2>{description && <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{description}</p>}</div>
    {href && <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline">{linkLabel || "View all"}<ArrowRight className="size-3.5" /></Link>}
  </div>;
}

export function StatTile({ label, value, tone = "blue", detail }: { label: string; value: string | number; tone?: "blue" | "green" | "amber" | "red"; detail?: string }) {
  const tones = { blue: "text-primary bg-primary/5", green: "text-emerald-600 bg-emerald-500/5 dark:text-emerald-400", amber: "text-amber-600 bg-amber-500/5 dark:text-amber-400", red: "text-rose-600 bg-rose-500/5 dark:text-rose-400" };
  return <div className={cn("rounded-2xl border p-3.5 sm:p-4", tones[tone])}><p className="text-xl font-bold tabular-nums sm:text-2xl">{value}</p><p className="mt-1 text-xs font-medium text-foreground">{label}</p>{detail && <p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p>}</div>;
}

export function LinkRow({ href, icon, title, detail, end }: { href: string; icon: ReactNode; title: string; detail?: string; end?: ReactNode }) {
  return <Link href={href} className="flex min-h-16 items-center gap-3 border-b border-border/70 px-4 py-3 last:border-b-0 hover:bg-muted/50">
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span>
    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{title}</span>{detail && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{detail}</span>}</span>
    {end || <ArrowRight className="size-4 shrink-0 text-muted-foreground" />}
  </Link>;
}
