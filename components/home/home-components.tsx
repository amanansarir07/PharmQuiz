import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
    <section className="relative isolate overflow-hidden rounded-[var(--radius-hero)] bg-[linear-gradient(135deg,var(--hero-from),var(--hero-to))] p-5 text-white shadow-[var(--shadow-card)] sm:p-6" aria-label={title}>
      <span className="pointer-events-none absolute -right-8 -top-12 -z-10 size-40 rounded-full bg-white/10" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-20 right-20 -z-10 size-40 rounded-full bg-white/[0.08]" aria-hidden="true" />
      <p className="text-xs font-semibold text-white/80">{meta}</p>
      <h2 className="mt-2 max-w-sm text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm leading-5 text-white/85">{description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
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
}: {
  href: string;
  icon: ReactNode;
  title: string;
  detail: string;
  progress?: number;
  colorIndex?: number;
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
    <Link href={href} className="flex min-h-[72px] items-center gap-3 rounded-2xl bg-card px-3.5 py-3 shadow-[var(--shadow-card)] transition-transform active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl [&>svg]:size-5", colorClasses[colorIndex % colorClasses.length])} aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold leading-5">{title}</span>
        <span className="mt-0.5 block truncate text-xs leading-4 text-muted-foreground">{detail}</span>
        {progress !== undefined && (
          <span className="mt-2 block h-1 overflow-hidden rounded-full bg-muted" aria-label={`${Math.round(progress)}% progress`}>
            <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          </span>
        )}
      </span>
      {progress !== undefined && <span className="text-xs font-bold tabular-nums text-primary">{Math.round(progress)}%</span>}
    </Link>
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
    <div className="min-w-0 rounded-2xl bg-card px-3 py-3.5 shadow-[var(--shadow-card)] sm:p-4">
      <span className={cn("mb-3 inline-flex size-8 items-center justify-center rounded-xl [&>svg]:size-4", toneClasses[tone])} aria-hidden="true">{icon}</span>
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
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  tone?: "brand" | "danger";
}) {
  return (
    <Link href={href} className="flex min-h-32 flex-col rounded-2xl bg-card p-3.5 shadow-[var(--shadow-card)] transition-transform active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4">
      <span className={cn("mb-3 flex size-9 items-center justify-center rounded-xl [&>svg]:size-[18px]", tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary")} aria-hidden="true">{icon}</span>
      <span className="text-sm font-bold leading-5">{title}</span>
      <span className="mt-1 text-xs leading-4 text-muted-foreground">{description}</span>
    </Link>
  );
}
