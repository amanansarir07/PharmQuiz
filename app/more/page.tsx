"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { LearningPage, PageHeading, SectionHeading } from "@/components/learning-ui";
import { AppError, AppLoading } from "@/components/app-state";

const libraryLinks = [
  { href: "/review", label: "Question bank", detail: "Find questions and explanations" },
  { href: "/bookmarks", label: "Saved questions", detail: "Account required", accountRequired: true },
  { href: "/notes", label: "Study notes", detail: "Account required", accountRequired: true },
  { href: "/mistakes", label: "Mistakes", detail: "Account required", accountRequired: true },
  { href: "/history", label: "Practice history", detail: "Account required", accountRequired: true },
  { href: "/analytics", label: "Progress", detail: "Account required", accountRequired: true },
  { href: "/leaderboard", label: "Leaderboard", detail: "Account required", accountRequired: true },
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
    <section className="border-b pb-5">
      <p className="text-base font-semibold">{user?.name || "Guest learner"}</p>
      <p className="mt-1 text-sm text-muted-foreground">{program.shortLabel}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
        {user ? <Link href="/profile" className="text-primary">View profile</Link> : <><Link href={`/auth/register?program=${encodeURIComponent(program.slug)}`} className="text-primary">Create account</Link><Link href="/auth/login">Log in</Link></>}
      </div>
    </section>
    <section className="mt-6">
      <SectionHeading title="Study library" />
      <div className="divide-y border-y">{libraryLinks.map(({ href, label, detail, accountRequired }) => <Link key={href} href={href} className="flex min-h-14 items-center justify-between gap-3 py-3 text-sm font-medium hover:text-primary"><span>{label}</span>{!user && accountRequired && <span className="text-xs font-normal text-muted-foreground">{detail}</span>}</Link>)}</div>
    </section>
    <section className="mt-6">
      <SectionHeading title="Preferences" />
      <div className="divide-y border-y">
        <Link href="/settings" className="flex min-h-14 items-center text-sm font-medium hover:text-primary">Settings</Link>
        <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="flex min-h-14 w-full items-center justify-between text-left text-sm font-medium"><span>Appearance</span><span className="text-xs font-normal text-muted-foreground">{themeReady ? resolvedTheme === "dark" ? "Dark" : "Light" : "System"}</span></button>
        {isAdmin && <Link href="/admin/questions" className="flex min-h-14 items-center text-sm font-medium hover:text-primary">Admin tools</Link>}
      </div>
    </section>
  </LearningPage>;
}
