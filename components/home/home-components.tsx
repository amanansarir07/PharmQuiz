import Link from "next/link";
import type { ReactNode } from "react";
import {
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Dna,
  FlaskConical,
  HeartPulse,
  Leaf,
  Microscope,
  Pill,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    <section className="relative isolate overflow-hidden rounded-[var(--radius-hero)] bg-[linear-gradient(135deg,var(--hero-from),var(--hero-to))] p-4 text-white shadow-[var(--shadow-card)] [@media(max-height:820px)]:p-3 sm:p-6" aria-label={title}>
      <span className="pointer-events-none absolute -right-8 -top-12 -z-10 size-40 rounded-full bg-white/10" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-20 right-20 -z-10 size-40 rounded-full bg-white/[0.08]" aria-hidden="true" />
      <p className="text-xs font-semibold text-white/80">{meta}</p>
      <h2 className="mt-1 max-w-sm text-xl font-extrabold leading-tight tracking-tight [@media(max-height:820px)]:mt-0 sm:text-2xl">{title}</h2>
      <p className="mt-1 max-w-sm text-sm leading-5 text-white/85">{description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 [@media(max-height:820px)]:mt-3">
        <Link href={href} className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
          {actionLabel}
        </Link>
        <span className="text-xs font-medium text-white/80">Up to 10 questions</span>
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
    <Link href={href} className={cn("flex items-center gap-3 rounded-2xl bg-card shadow-[var(--shadow-card)] transition-transform active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", compact ? "min-h-16 px-3 py-2.5 [@media(max-height:820px)]:min-h-[60px] [@media(max-height:820px)]:py-2" : "min-h-[72px] px-3.5 py-3")}>
      <span className={cn("flex shrink-0 items-center justify-center rounded-2xl [&>svg]:size-5", compact ? "size-10" : "size-12", colorClasses[colorIndex % colorClasses.length])} aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold leading-5">{title}</span>
        <span className="mt-0.5 block truncate text-xs leading-4 text-muted-foreground">{detail}</span>
        {progress !== undefined && !showProgress && (
          <span className="mt-2 block h-1 overflow-hidden rounded-full bg-muted" aria-label={`${Math.round(progress)}% progress`}>
            <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          </span>
        )}
      </span>
      {showProgress && (
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
      {progress !== undefined && !showProgress && <span className="text-xs font-bold tabular-nums text-primary">{Math.round(progress)}%</span>}
      {showChevron && <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
    </Link>
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
