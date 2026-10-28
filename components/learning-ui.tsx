import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function LearningPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1100px] px-4 pb-8 pt-5 sm:px-7 sm:pt-8 lg:px-9 lg:pb-12 lg:pt-9", className)}>{children}</div>;
}

export function PageHeading({ eyebrow, title, description, backHref, hideBackOnMobile, action }: {
  eyebrow?: string; title: string; description?: string; backHref?: string; hideBackOnMobile?: boolean; action?: ReactNode;
}) {
  return <header className="mb-6 sm:mb-7">
    {backHref && <Link href={backHref} className={cn("mb-4 min-h-9 items-center gap-1 rounded-lg pr-3 text-sm font-medium text-muted-foreground hover:text-foreground", hideBackOnMobile ? "hidden md:inline-flex" : "inline-flex")}><ChevronLeft className="size-4" /> Back</Link>}
    <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1.5 text-xs font-medium text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-[1.45rem] font-bold leading-tight tracking-tight text-foreground sm:text-[1.7rem]">{title}</h1>
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
    <div><h2 className="text-[15px] font-bold tracking-tight sm:text-base">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>}</div>
    {href && <Link href={href} className="inline-flex min-h-9 shrink-0 items-center text-xs font-semibold text-primary hover:underline">{linkLabel || "View all"}</Link>}
  </div>;
}

export function WeeklyProgress({ entries, className }: {
  entries?: Array<{ completedAt: string; total: number }> | null;
  className?: string;
}) {
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const weekdayFormatter = new Intl.DateTimeFormat("en", { timeZone: "UTC", weekday: "short" });
  const getDateKey = (date: Date) => {
    if (Number.isNaN(date.getTime())) return null;
    const parts = dateFormatter.formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || "";
    return `${part("year")}-${part("month")}-${part("day")}`;
  };
  const today = new Date();
  const todayKey = getDateKey(today) || today.toISOString().slice(0, 10);
  const todayUtc = new Date(`${todayKey}T00:00:00.000Z`);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(todayUtc);
    date.setUTCDate(date.getUTCDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const entriesForDay = entries?.filter((entry) => getDateKey(new Date(entry.completedAt)) === key) ?? [];
    return {
      key,
      label: weekdayFormatter.format(date),
      sessions: entriesForDay.length,
      questions: entriesForDay.reduce((total, entry) => total + entry.total, 0),
    };
  });
  const totalSessions = days.reduce((total, day) => total + day.sessions, 0);
  const totalQuestions = days.reduce((total, day) => total + day.questions, 0);
  const maxSessions = Math.max(1, ...days.map((day) => day.sessions));

  return <section className={cn("rounded-2xl border border-primary/15 bg-primary/[0.04] p-3.5 sm:p-5", className)} aria-label="Practice activity in the last seven days">
    <div className="flex items-baseline justify-between gap-3">
      <div>
        <h2 className="text-sm font-bold tracking-tight">Your last 7 days</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {entries === undefined || entries === null
            ? "Loading your practice activity"
            : totalSessions > 0
              ? `${totalSessions} ${totalSessions === 1 ? "session" : "sessions"} · ${totalQuestions} questions`
              : "A short practice is a good place to start"}
        </p>
      </div>
      {entries === undefined || entries === null
        ? <span className="h-5 w-14 animate-pulse rounded bg-muted" aria-hidden="true" />
        : <span className="text-xs font-semibold tabular-nums text-primary">{totalSessions} sessions</span>}
    </div>
    <div className="mt-3 grid grid-cols-7 gap-2" aria-hidden="true">
      {days.map((day) => (
        <div key={day.key} className="flex flex-col items-center gap-1.5">
          <div className="flex h-8 w-full items-end overflow-hidden rounded-md bg-background/80">
            <div
              className={cn("w-full rounded-sm bg-primary transition-[height]", entries == null && "animate-pulse")}
              style={{ height: entries == null ? "35%" : day.sessions ? `${Math.max(22, (day.sessions / maxSessions) * 100)}%` : "4%" }}
            />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">{day.label.slice(0, 2)}</span>
        </div>
      ))}
    </div>
  </section>;
}

export function StatTile({ label, value, tone = "blue", detail }: { label: string; value: string | number; tone?: "blue" | "green" | "amber" | "red"; detail?: string }) {
  return <div className="rounded-xl border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5"><p className={cn("text-2xl font-bold leading-none tracking-tight tabular-nums", tone === "blue" && "text-primary", tone === "green" && "text-[var(--success)]", tone === "amber" && "text-[var(--warning)]", tone === "red" && "text-destructive")}>{value}</p><p className="mt-2 text-xs font-medium text-muted-foreground">{label}</p>{detail && <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>}</div>;
}

export function LinkRow({ href, icon, title, detail, end }: { href: string; icon?: ReactNode; title: string; detail?: string; end?: ReactNode }) {
  return <Link href={href} className="flex min-h-16 items-center gap-3 border-b border-border/70 px-4 py-3 last:border-b-0 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50">
    {icon && <span className="flex size-8 shrink-0 items-center justify-center text-muted-foreground">{icon}</span>}
    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold leading-5">{title}</span>{detail && <span className="mt-1 block text-xs leading-5 text-muted-foreground">{detail}</span>}</span>
    {end}
  </Link>;
}

export function SubjectIcon({ slug, className }: { slug: string; className?: string }) {
  const initial = slug.trim().charAt(0).toUpperCase();
  return <span aria-hidden="true" className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground", className)}>{initial}</span>;
}

export function ScoreRing({ value, label, size = 144 }: { value: number; label: string; size?: number }) {
  const percentage = Math.min(100, Math.max(0, value));
  return <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${Math.round(percentage)} percent`}><svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true"><circle cx="60" cy="60" r="51" fill="none" stroke="currentColor" className="text-muted" strokeWidth="8" /><circle cx="60" cy="60" r="51" fill="none" stroke="currentColor" className="text-primary" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${percentage * 3.2044} 320.44`} /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-bold tracking-tight tabular-nums">{Math.round(percentage)}<span className="text-lg">%</span></span><span className="mt-1 text-[10px] font-medium text-muted-foreground">{label}</span></div></div>;
}
