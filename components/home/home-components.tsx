import Link from "next/link";
import type { ReactNode } from "react";
import {
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Dna,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  Leaf,
  Microscope,
  Pill,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSubjectName } from "@/data/registry";
import type { HistoryEntry } from "@/lib/history";

export function getSubjectIcon(slug: string, name: string): ReactNode {
  const subject = `${slug} ${name}`.toLowerCase();
  if (subject.includes("pharmacognosy") || subject.includes("medicinal plant")) return <Leaf />;
  if (subject.includes("pharmacology")) return <Pill />;
  if (subject.includes("pharmaceutics")) return <FlaskConical />;
  if (subject.includes("chemistry")) return <FlaskConical />;
  if (subject.includes("microbiology")) return <Microscope />;
  if (subject.includes("biochemistry")) return <Dna />;
  if (subject.includes("therapeutics") || subject.includes("clinical pharmacy")) return <Stethoscope />;
  if (subject.includes("anatomy") || subject.includes("physiology") || subject.includes("public health")) return <HeartPulse />;
  if (subject.includes("management")) return <ClipboardCheck />;
  return <BookOpen />;
}

export function HeroCard({
  title,
  description,
  href,
  actionLabel,
  meta,
}: {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  meta: string;
}) {
  return (
    <section className="relative isolate flex h-[180px] overflow-hidden rounded-[var(--radius-hero)] bg-[linear-gradient(135deg,var(--hero-from),var(--hero-to))] p-4 text-white shadow-[var(--shadow-card)] sm:p-5" aria-label={title}>
      <div className="relative z-10 flex w-[64%] flex-col items-start justify-center">
        <p className="text-[11px] font-semibold text-white/85">{meta}</p>
        <h2 className="mt-1 line-clamp-2 text-lg font-extrabold leading-tight tracking-tight sm:text-xl">{title}</h2>
        <p className="mt-1 line-clamp-2 text-xs leading-4 text-white/90 sm:text-sm">{description}</p>
        <Link href={href} className="mt-3 inline-flex min-h-9 items-center justify-center rounded-full bg-white px-4 text-xs font-bold text-[var(--home-pill-foreground)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hero-to)] sm:min-h-10 sm:text-sm">
          {actionLabel}
        </Link>
      </div>
      <div className="pointer-events-none absolute -bottom-8 -right-5 flex size-40 items-center justify-center rounded-full bg-white/15 sm:-right-2 sm:size-44" aria-hidden="true">
        <GraduationCap className="size-[120px] -rotate-6 text-white/80" strokeWidth={1.25} />
      </div>
    </section>
  );
}

export function HomeListRow({
  href,
  icon,
  title,
  detail,
  progress,
  colorIndex = 0,
  compact = false,
  showProgress = false,
  showChevron = false,
  monochrome = false,
  unitProgress,
  gridCard = false,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  detail: string;
  progress?: number;
  colorIndex?: number;
  compact?: boolean;
  showProgress?: boolean;
  showChevron?: boolean;
  monochrome?: boolean;
  unitProgress?: { completed: number; total: number };
  gridCard?: boolean;
}) {
  const colorClasses = [
    "bg-[var(--subject-indigo-bg)] text-[var(--subject-indigo-fg)]",
    "bg-[var(--subject-pink-bg)] text-[var(--subject-pink-fg)]",
    "bg-[var(--subject-amber-bg)] text-[var(--subject-amber-fg)]",
    "bg-[var(--subject-green-bg)] text-[var(--subject-green-fg)]",
    "bg-[var(--subject-sky-bg)] text-[var(--subject-sky-fg)]",
    "bg-[var(--subject-violet-bg)] text-[var(--subject-violet-fg)]",
  ];

  return (
    <Link href={href} className={cn("bg-card shadow-[var(--shadow-card)] transition-transform active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", gridCard ? "relative flex min-h-[148px] flex-col items-stretch gap-2.5 rounded-[var(--radius-card)] p-3.5" : cn("flex items-center gap-3", compact ? "min-h-[72px] rounded-[var(--radius-card)] px-3 py-2.5" : "min-h-[72px] rounded-2xl px-3.5 py-3"))}>
      <span className={cn("flex shrink-0 items-center justify-center [&>svg]:size-5", gridCard ? "size-10 rounded-xl" : cn("rounded-2xl", compact ? "size-[52px]" : "size-12"), monochrome ? "bg-[var(--home-brand-50)] text-[var(--home-brand-600)]" : colorClasses[colorIndex % colorClasses.length])} aria-hidden="true">
        {icon}
      </span>
      <span className={cn("min-w-0", gridCard ? "w-full flex-1" : "flex-1")}>
        <span className={cn("block text-sm font-bold leading-5", gridCard ? "line-clamp-2" : "truncate")}>{title}</span>
        <span className={cn("mt-0.5 block text-xs leading-4 text-muted-foreground", gridCard ? "line-clamp-2" : "truncate")}>{detail}</span>
        {unitProgress && (
          <span className="mt-1.5 block">
            <span className="block text-[10px] font-medium leading-3 text-muted-foreground">{unitProgress.completed}/{unitProgress.total} units</span>
            <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${unitProgress.total ? Math.min(100, Math.max(0, (unitProgress.completed / unitProgress.total) * 100)) : 0}%` }} />
            </span>
          </span>
        )}
        {progress !== undefined && !showProgress && !unitProgress && (
          <span className="mt-2 block">
            {gridCard && <span className="mb-1 block text-right text-[10px] font-semibold tabular-nums text-muted-foreground">{Math.round(progress)}%</span>}
            <span className="block h-1 overflow-hidden rounded-full bg-muted" aria-label={`${Math.round(progress)}% progress`}>
              <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
            </span>
          </span>
        )}
      </span>
      {showProgress && !unitProgress && (
        <span className="flex w-10 shrink-0 flex-col items-center gap-1.5">
          <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
            {progress !== undefined ? `${Math.round(progress)}%` : "—"}
          </span>
          <span className="block h-1 w-8 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            {progress !== undefined && (
              <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
            )}
          </span>
          <span className="sr-only">{progress !== undefined ? `${Math.round(progress)}% practice accuracy` : "No practice yet"}</span>
        </span>
      )}
      {progress !== undefined && !showProgress && !gridCard && <span className="text-xs font-bold tabular-nums text-primary">{Math.round(progress)}%</span>}
      {showChevron && <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground", gridCard && "absolute right-3.5 top-6")} aria-hidden="true" />}
    </Link>
  );
}

export function ProfileCard({
  name,
  points,
  rank,
  streak,
  guest = false,
}: {
  name: string;
  points: string | number;
  rank: string | number;
  streak: string | number;
  guest?: boolean;
}) {
  return (
    <section className="rounded-[var(--radius-card)] bg-[linear-gradient(120deg,var(--home-profile-from),var(--home-profile-to))] p-4 text-white shadow-[var(--shadow-card)]" aria-label="Learner profile and progress">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-base font-extrabold ring-1 ring-white/30" aria-hidden="true">
          {name.trim().charAt(0).toUpperCase() || "B"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{name}</p>
          {guest && <p className="mt-0.5 text-xs text-white/80">Sign in to track your rank</p>}
        </div>
        {guest && (
          <Link href="/auth/login" className="inline-flex min-h-9 shrink-0 items-center rounded-full bg-white px-3.5 text-xs font-bold text-[var(--home-pill-foreground)] transition-opacity hover:opacity-90">
            Sign in
          </Link>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 divide-x divide-white/25 border-t border-white/20 pt-3">
        {[
          { label: "Points", value: points },
          { label: "Rank", value: rank },
          { label: "Streak", value: streak },
        ].map(({ label, value }) => (
          <div key={label} className="min-w-0 px-2 first:pl-0 last:pr-0">
            <p className="truncate text-lg font-extrabold leading-5 tabular-nums">{value}</p>
            <p className="mt-1 text-[10px] font-semibold text-white/75">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RecentQuizList({ entries }: { entries: HistoryEntry[] | null }) {
  if (entries === null) {
    return <section aria-label="Recent quizzes"><p className="text-sm text-muted-foreground">Loading recent quizzes…</p></section>;
  }

  const recent = entries.slice(0, 3);
  return (
    <section aria-label="Recent quizzes">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold tracking-tight">Recent quizzes</h2>
        {recent.length > 0 && <Link href="/history" className="text-xs font-semibold text-primary">View all</Link>}
      </div>
      {recent.length === 0 ? (
        <div className="col-span-full rounded-[var(--radius-card)] bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-sm font-semibold">Your quiz history starts here</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Finish a practice quiz to see your score and review it here.</p>
          <Link href="/quiz" className="mt-3 inline-flex min-h-9 items-center rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground">Take your first quiz</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {recent.map((entry) => {
            const percentage = entry.total ? Math.round((entry.correct / entry.total) * 100) : 0;
            const passed = percentage >= 70;
            const subjectName = getSubjectName(entry.subject);
            return (
              <Link key={entry.key} href={entry.localSessionId ? `/quiz/${entry.localSessionId}/results` : "/history"} className="flex min-h-[150px] flex-col items-start gap-2.5 rounded-[var(--radius-card)] bg-card p-3.5 shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="flex w-full items-center justify-between">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--home-brand-50)] text-[var(--home-brand-600)] [&>svg]:size-5" aria-hidden="true">{getSubjectIcon(entry.subject, subjectName)}</span>
                  <span className="text-sm font-extrabold tabular-nums">{entry.correct}/{entry.total}</span>
                </span>
                <span className="w-full min-w-0 flex-1">
                  <span className="block line-clamp-2 text-sm font-bold leading-5">{subjectName}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">{entry.total} questions</span>
                </span>
                <span className={cn("rounded-full px-2 py-1 text-[10px] font-bold", passed ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/15 text-[var(--warning)]")}>{passed ? "Passed" : "Needs work"}</span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function HomeActionRow({
  icon,
  title,
  detail,
  onClick,
  tone = "brand",
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  onClick: () => void;
  tone?: "brand" | "success" | "warning" | "danger";
}) {
  const toneClasses = {
    brand: "bg-secondary text-primary",
    success: "bg-[var(--subject-green-bg)] text-[var(--subject-green-fg)]",
    warning: "bg-[var(--subject-amber-bg)] text-[var(--subject-amber-fg)]",
    danger: "bg-destructive/10 text-destructive",
  };

  return (
    <button type="button" onClick={onClick} className="flex min-h-[72px] w-full items-center gap-3 rounded-2xl bg-card px-3.5 py-3 text-left shadow-[var(--shadow-card)] transition-transform active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl [&>svg]:size-5", toneClasses[tone])} aria-hidden="true">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold leading-5">{title}</span>
        <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">{detail}</span>
      </span>
    </button>
  );
}

export function HomeStatTile({
  icon,
  value,
  label,
  tone = "brand",
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
  tone?: "brand" | "success" | "warning";
}) {
  const toneClasses = {
    brand: "bg-secondary text-primary",
    success: "bg-[var(--subject-green-bg)] text-[var(--subject-green-fg)]",
    warning: "bg-[var(--subject-amber-bg)] text-[var(--subject-amber-fg)]",
  };

  return (
    <div className="min-w-0 rounded-2xl bg-card px-3 py-2.5 shadow-[var(--shadow-card)] [@media(max-height:820px)]:py-2 sm:p-4">
      <span className={cn("mb-2 inline-flex size-7 items-center justify-center rounded-xl [&>svg]:size-4 [@media(max-height:820px)]:mb-1 [@media(max-height:820px)]:size-6", toneClasses[tone])} aria-hidden="true">{icon}</span>
      <p className="truncate text-xl font-extrabold leading-none tracking-tight tabular-nums sm:text-2xl">{value}</p>
      <p className="mt-1.5 truncate text-[11px] font-semibold text-muted-foreground sm:text-xs">{label}</p>
    </div>
  );
}

export function FeatureCard({
  href,
  icon,
  title,
  description,
  tone = "brand",
  compact = false,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  tone?: "brand" | "danger";
  compact?: boolean;
}) {
  return (
    <Link href={href} className={cn("flex flex-col rounded-2xl bg-card shadow-[var(--shadow-card)] transition-transform active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", compact ? "min-h-24 p-3" : "min-h-32 p-3.5 sm:p-4")}>
      <span className={cn("flex items-center justify-center rounded-xl [&>svg]:size-[18px]", compact ? "mb-2 size-8" : "mb-3 size-9", tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary")} aria-hidden="true">{icon}</span>
      <span className={cn("text-sm font-bold", compact ? "leading-4" : "leading-5")}>{title}</span>
      <span className={cn("mt-1 text-xs leading-4 text-muted-foreground", compact && "line-clamp-1")}>{description}</span>
    </Link>
  );
}
