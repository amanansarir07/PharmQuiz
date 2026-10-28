"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  BookOpen,
  Bookmark,
  ChartNoAxesCombined,
  History,
  NotebookPen,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sun,
  Trophy,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { LearningPage, PageHeading, SectionHeading } from "@/components/learning-ui";
import { AppError, AppLoading } from "@/components/app-state";

const libraryLinks = [
  { href: "/review", label: "Question bank", detail: "Questions and explanations", icon: BookOpen },
  { href: "/bookmarks", label: "Saved questions", detail: "Your revision list", icon: Bookmark, accountRequired: true },
  { href: "/notes", label: "Study notes", detail: "Notes by subject", icon: NotebookPen, accountRequired: true },
  { href: "/mistakes", label: "Mistakes", detail: "Questions to revisit", icon: RotateCcw, accountRequired: true },
  { href: "/history", label: "Practice history", detail: "Past quiz results", icon: History, accountRequired: true },
  { href: "/analytics", label: "Progress", detail: "Accuracy and activity", icon: ChartNoAxesCombined, accountRequired: true },
  { href: "/leaderboard", label: "Leaderboard", detail: "Compare your progress", icon: Trophy, accountRequired: true },
];

export default function MorePage() {
  const { user, isAdmin, isLoading, authRestorationTimedOut } = useAuth();
  const { program } = useActiveProgram();
  const { resolvedTheme, setTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setThemeReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (isLoading) return <AppLoading label="Loading your study tools" />;
  if (authRestorationTimedOut) return <AppError title="Could not check your session" description="We could not confirm your account right now. Please try again." onRetry={() => window.location.reload()} />;

  return <LearningPage className="max-w-[800px]">
    <PageHeading title="Library and account" />
    <section className="rounded-2xl bg-card p-4 shadow-[var(--shadow-card)] sm:p-5" aria-label="Account and programme">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary" aria-hidden="true">
          <UserRound className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{user?.name || "Guest learner"}</p>
          <p className="mt-1 text-xs text-muted-foreground">{program.shortLabel}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {user ? (
          <Link href="/profile" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-3 text-center text-xs font-semibold text-primary-foreground">View profile</Link>
        ) : (
          <>
            <Link href={`/auth/register?program=${encodeURIComponent(program.slug)}`} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-3 text-center text-xs font-semibold text-primary-foreground">Create account</Link>
            <Link href="/auth/login" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-secondary px-3 text-center text-xs font-semibold text-secondary-foreground">Log in</Link>
          </>
        )}
      </div>
    </section>
    <section className="mt-7">
      <SectionHeading title="Study library" />
      <div className="grid grid-cols-2 gap-3">
        {libraryLinks.map(({ href, label, detail, icon: Icon, accountRequired }) => (
          <Link key={href} href={href} className="flex min-h-[132px] flex-col rounded-2xl bg-card p-3.5 shadow-[var(--shadow-card)] transition-transform active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[140px] sm:p-4">
            <span className="mb-3 flex w-full items-center justify-between gap-1">
              <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary" aria-hidden="true"><Icon className="size-[18px]" /></span>
              {!user && accountRequired && <span className="text-right text-[9px] font-semibold leading-3 text-muted-foreground">Sign in<br />required</span>}
            </span>
            <span className="block text-sm font-bold leading-5">{label}</span>
            <span className="mt-1 line-clamp-2 text-xs leading-4 text-muted-foreground">{detail}</span>
          </Link>
        ))}
      </div>
    </section>
    <section className="mt-7">
      <SectionHeading title="Preferences" />
      <div className="grid grid-cols-2 gap-3">
        <Link href="/settings" className="flex min-h-[112px] flex-col rounded-2xl bg-card p-3.5 shadow-[var(--shadow-card)] transition-transform active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4">
          <span className="mb-3 flex size-9 items-center justify-center rounded-xl bg-secondary text-primary" aria-hidden="true"><Settings className="size-[18px]" /></span>
          <span className="text-sm font-bold">Settings</span>
          <span className="mt-1 text-xs leading-4 text-muted-foreground">Programme and account</span>
        </Link>
        <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="flex min-h-[112px] flex-col rounded-2xl bg-card p-3.5 text-left shadow-[var(--shadow-card)] transition-transform active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4">
          <span className="mb-3 flex size-9 items-center justify-center rounded-xl bg-secondary text-primary" aria-hidden="true"><Sun className="size-[18px]" /></span>
          <span className="text-sm font-bold">Appearance</span>
          <span className="mt-1 text-xs leading-4 text-muted-foreground">{themeReady ? resolvedTheme === "dark" ? "Dark mode" : "Light mode" : "System theme"}</span>
        </button>
        {isAdmin && (
          <Link href="/admin/questions" className="flex min-h-[112px] flex-col rounded-2xl bg-card p-3.5 shadow-[var(--shadow-card)] transition-transform active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4">
            <span className="mb-3 flex size-9 items-center justify-center rounded-xl bg-secondary text-primary" aria-hidden="true"><ShieldCheck className="size-[18px]" /></span>
            <span className="text-sm font-bold">Admin tools</span>
            <span className="mt-1 text-xs leading-4 text-muted-foreground">Manage question banks</span>
          </Link>
        )}
      </div>
    </section>
  </LearningPage>;
}
