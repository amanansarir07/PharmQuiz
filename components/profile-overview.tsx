"use client";

import { useEffect, useState } from "react";
import { BarChart3, Bookmark, GraduationCap, NotebookPen, RotateCcw, Settings, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { calculateStats, type UserStats } from "@/lib/stats";
import { LinkRow, PageHeading, StatTile } from "@/components/learning-ui";

export function ProfileOverview() {
  const { user } = useAuth();
  const { program, programSlug } = useActiveProgram();
  const [stats, setStats] = useState<UserStats | null>(null);
  useEffect(() => { if (!user) return; let active = true; void calculateStats(user.id, programSlug).then((value) => { if (active) setStats(value); }); return () => { active = false; }; }, [user, programSlug]);
  if (!user) return null;
  const initials = user.name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return <>
    <PageHeading eyebrow="Your account" title="Profile" description="Your learning journey in Bujh." />
    <div className="relative overflow-hidden rounded-3xl border bg-card p-7 text-center before:absolute before:inset-x-0 before:top-0 before:h-20 before:bg-primary/10"><span className="relative mx-auto flex size-20 ring-4 ring-card items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">{initials || <UserRound className="size-7" />}</span><h2 className="mt-3 text-lg font-bold">{user.name}</h2><p className="mt-1 text-xs text-muted-foreground">{program.name}{program.level ? ` · ${program.level}` : ""}</p></div>
    {stats && stats.quizzesTaken > 0 && <div className="mt-3 grid grid-cols-3 gap-2"><StatTile label="Streak" value={stats.currentStreak} tone="amber" /><StatTile label="Quizzes" value={stats.quizzesTaken} /><StatTile label="Accuracy" value={`${stats.accuracy}%`} tone="green" /></div>}
    <div className="mt-6 grid overflow-hidden rounded-2xl border bg-card sm:grid-cols-2">
      <LinkRow href="/analytics" icon={<BarChart3 className="size-5" />} title="My progress" />
      <LinkRow href="/bookmarks" icon={<Bookmark className="size-5" />} title="Saved questions" />
      <LinkRow href="/notes" icon={<NotebookPen className="size-5" />} title="Notes" />
      <LinkRow href="/mistakes" icon={<RotateCcw className="size-5" />} title="Mistakes Bank" />
      <LinkRow href="/programs" icon={<GraduationCap className="size-5" />} title="Switch programme" />
      <LinkRow href="/settings" icon={<Settings className="size-5" />} title="Settings" />
    </div>
  </>;
}
