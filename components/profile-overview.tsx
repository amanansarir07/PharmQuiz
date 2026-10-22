"use client";

import { useEffect, useState } from "react";
import { BarChart3, Bookmark, GraduationCap, NotebookPen, RotateCcw, Settings, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { calculateStats, type UserStats } from "@/lib/stats";
import { LinkRow, PageHeading } from "@/components/learning-ui";

export function ProfileOverview() {
  const { user } = useAuth();
  const { program, programSlug } = useActiveProgram();
  const [stats, setStats] = useState<UserStats | null>(null);
  useEffect(() => {
    if (!user) return;
    let active = true;
    void calculateStats(user.id, programSlug).then((value) => { if (active) setStats(value); });
    return () => { active = false; };
  }, [user, programSlug]);
  if (!user) return null;
  const initials = user.name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return <>
    <PageHeading title="Profile" />
    <div className="flex items-center gap-4 border-b pb-5">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">{initials || <UserRound className="size-6" />}</span>
      <div className="min-w-0"><h2 className="truncate text-lg font-bold">{user.name}</h2><p className="text-sm text-muted-foreground">{program.name}{program.level ? ` · ${program.level}` : ""}</p></div>
    </div>
    {stats && stats.quizzesTaken > 0 && <p className="mt-4 text-sm text-muted-foreground">{stats.quizzesTaken} sessions · {stats.accuracy}% accuracy · {stats.currentStreak} day streak</p>}
    <div className="mt-5 divide-y border-y sm:grid sm:grid-cols-2 sm:divide-y-0">
      <LinkRow href="/analytics" icon={<BarChart3 className="size-5" />} title="My progress" />
      <LinkRow href="/bookmarks" icon={<Bookmark className="size-5" />} title="Saved questions" />
      <LinkRow href="/notes" icon={<NotebookPen className="size-5" />} title="Notes" />
      <LinkRow href="/mistakes" icon={<RotateCcw className="size-5" />} title="Mistakes bank" />
      <LinkRow href="/programs" icon={<GraduationCap className="size-5" />} title="Switch programme" />
      <LinkRow href="/settings" icon={<Settings className="size-5" />} title="Settings" />
    </div>
  </>;
}
