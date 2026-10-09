"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { BarChart3, BookOpen, Bookmark, ChevronRight, ClipboardList, GraduationCap, History, LockKeyhole, LogIn, Moon, NotebookPen, RotateCcw, Settings, Sun, Target, Trophy, UserRound } from "lucide-react";
import { LearningPage, PageHeading } from "@/components/learning-ui";

const links = [
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/review", label: "Question bank", icon: BookOpen },
  { href: "/bookmarks", label: "Saved questions", icon: Bookmark, accountRequired: true },
  { href: "/notes", label: "Study notes", icon: NotebookPen, accountRequired: true },
  { href: "/mistakes", label: "Mistakes Bank", icon: RotateCcw, accountRequired: true },
  { href: "/history", label: "Quiz history", icon: History, accountRequired: true },
  { href: "/analytics", label: "Performance", icon: BarChart3, accountRequired: true },
  { href: "/mock-test", label: "Mock tests", icon: ClipboardList, accountRequired: true },
  { href: "/quiz", label: "Practice", icon: Target },
];

export default function MorePage() {
  const { user } = useAuth();
  const { program } = useActiveProgram();
  const { resolvedTheme, setTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setThemeReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const darkTheme = themeReady && resolvedTheme === "dark";

  return <LearningPage className="max-w-3xl">
    <PageHeading title="More" description="Your study tools and account." />

    <div className="mt-6 rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserRound className="size-5" /></span><div><p className="font-semibold">{user?.name || "Guest Student"}</p><p className="text-xs text-muted-foreground">{program.name}{program.level ? ` · ${program.level}` : ""}</p></div></div>
      <div className="mt-4 flex gap-2">
        {user ? <Link href="/profile" className="flex min-h-10 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">My profile</Link> : <><Link href={`/auth/register?program=${encodeURIComponent(program.slug)}`} className="flex min-h-10 flex-1 items-center justify-center rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground">Create account</Link><Link href="/auth/login" className="flex min-h-10 flex-1 items-center justify-center rounded-xl border px-3 text-sm font-semibold">Login</Link></>}
      </div>
    </div>

    <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
      <Link href="/programs" className="flex min-h-14 items-center gap-3 border-b px-4 hover:bg-muted/60"><GraduationCap className="size-5 text-primary" /><span className="flex-1 text-sm font-medium">Switch programme</span><ChevronRight className="size-4 text-muted-foreground" /></Link>
      {links.map(({ href, label, icon: Icon, accountRequired }) => <Link key={href} href={href} className="flex min-h-14 items-center gap-3 border-b px-4 last:border-0 hover:bg-muted/60"><Icon className="size-5 shrink-0 text-primary" /><span className="min-w-0 flex-1 text-sm font-medium">{label}</span>{!user && accountRequired && <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground"><LockKeyhole className="size-3.5" /> Account</span>}<ChevronRight className="size-4 shrink-0 text-muted-foreground" /></Link>)}
      <Link href="/settings" className="flex min-h-14 items-center gap-3 border-t px-4 hover:bg-muted/60"><Settings className="size-5 text-primary" /><span className="flex-1 text-sm font-medium">Settings</span><ChevronRight className="size-4 text-muted-foreground" /></Link>
    </div>
    <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
      <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="flex min-h-14 w-full items-center gap-3 px-4 text-left hover:bg-muted/60">{darkTheme ? <Moon className="size-5 text-primary" /> : <Sun className="size-5 text-primary" />}<span className="flex-1 text-sm font-medium">Appearance</span><span className="text-xs text-muted-foreground">{themeReady ? darkTheme ? "Dark" : "Light" : "System"}</span></button>
    </div>
    {!user && <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><LogIn className="size-4" /> Create an account to sync progress and saved study tools.</p>}
  </LearningPage>;
}
