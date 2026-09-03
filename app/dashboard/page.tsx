"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { subjects } from "@/data/subjects";
import { calculateStats } from "@/lib/stats";
import type { UserStats } from "@/lib/stats";
import {
  BookOpen,
  Trophy,
  Target,
  Flame,
  Brain,
  Play,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Student";
  const [stats, setStats] = useState<UserStats | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) calculateStats(user.id).then(setStats);
  }, [user]);

  useEffect(() => {
    const handler = () => { if (user) calculateStats(user.id).then(setStats); };
    window.addEventListener("focus", handler);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handler();
    });
    return () => window.removeEventListener("focus", handler);
  }, [user]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 animate-pulse">
        <div className="mb-6 space-y-2">
          <div className="h-7 w-48 bg-muted rounded-lg" />
          <div className="h-4 w-40 bg-muted rounded" />
        </div>
        <div className="h-14 w-full bg-muted rounded-xl mb-6" />
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted" />
                <div className="space-y-1.5">
                  <div className="h-3 w-14 bg-muted rounded" />
                  <div className="h-5 w-8 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const s = stats || { quizzesTaken: 0, totalCorrect: 0, totalAttempted: 0, accuracy: 0, currentStreak: 0, totalScore: 0, subjectBreakdown: {} };

  // Get recent results from localStorage
  const recentResults: Array<{sessionId: string; subject: string; score: number; total: number; accuracy: number; date: string}> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("quiz-results-")) {
      try {
        const data = JSON.parse(localStorage.getItem(key)!);
        if (data?.config?.completedAt) {
          const correctCount = data.answers?.filter((a: any) => a.isCorrect).length ?? 0;
          recentResults.push({
            sessionId: key.replace("quiz-results-", ""),
            subject: data.config.subject || "unknown",
            score: data.score ?? correctCount,
            total: data.questions?.length ?? 0,
            accuracy: data.questions?.length > 0 ? Math.round((correctCount / data.questions.length) * 100) : 0,
            date: data.config.completedAt,
          });
        }
      } catch {}
    }
  }
  recentResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recent = recentResults.slice(0, 3);

  const subjectNames: Record<string, string> = {
    "pharmacology-i": "Pharmacology I",
    "pharmaceutics-i": "Pharmaceutics I",
    "pharmaceutical-management": "Pharma Management",
    "public-health-pharmacy": "Public Health",
    "pharmacognosy": "Pharmacognosy",
    "biochemistry-microbiology": "Bio & Micro",
    "pharmaceutical-chemistry-i": "Pharma Chemistry I",
    "pharmacotherapeutics-i": "Pharma Therapeutics I",
  };

  const fmtTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return mins + "m ago";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + "h ago";
    return Math.floor(hrs / 24) + "d ago";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 sm:px-6">
      {/* Welcome + Start Quiz — the first thing user sees */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Hi, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What do you want to practice today?
        </p>
      </div>

      {/* Start Quiz CTA — prominent, visible immediately */}
      <Link href="/quiz" className="block mb-6">
        <Card className="bg-primary text-primary-foreground transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <Play className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg">Start MCQ Practice</p>
              <p className="text-sm opacity-80">Choose a subject and begin</p>
            </div>
            <ArrowRight className="h-5 w-5 opacity-80" />
          </CardContent>
        </Card>
      </Link>

      {/* Stats — 2x2 grid, compact */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: BookOpen, label: "MCQs Done", value: mounted ? String(s.quizzesTaken) : "0", color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950" },
          { icon: Target, label: "Accuracy", value: mounted ? (s.totalAttempted > 0 ? `${s.accuracy}%` : "--") : "--", color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950" },
          { icon: Flame, label: "Streak", value: mounted ? `${s.currentStreak}d` : "0d", color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950" },
          { icon: Trophy, label: "Score", value: mounted ? String(s.totalScore) : "0", color: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg sm:text-xl font-bold leading-tight">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity — compact */}
      {recent.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Recent Activity</h2>
            <Link href="/history" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {recent.map((r) => (
              <Link key={r.sessionId} href={"/quiz/" + r.sessionId + "/results"}>
                <Card className="transition-all hover:shadow-md cursor-pointer">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={"flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold " + (r.accuracy >= 70 ? "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400" : r.accuracy >= 50 ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400" : "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400")}>
                      {r.accuracy}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{subjectNames[r.subject] || r.subject}</p>
                      <p className="text-xs text-muted-foreground">{r.score}/{r.total} correct &middot; {fmtTime(r.date)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recent.length === 0 && (
        <div className="mb-6">
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Brain className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground mb-1">No quizzes taken yet</p>
              <p className="text-xs text-muted-foreground">Start your first quiz above!</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subjects — horizontal scroll on mobile, grid on desktop */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Subjects</h2>
          <Link href="/subjects" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
          {subjects.map((subject) => {
            const breakdown = mounted ? s.subjectBreakdown[subject.slug] : null;
            const unitsPracticed = breakdown ? Math.min(Math.ceil((breakdown.total / 10)), subject.units.length) : 0;
            const accuracy = breakdown ? breakdown.accuracy : 0;

            return (
              <Link key={subject.id} href={"/subjects/" + subject.slug}>
                <Card className="transition-all hover:shadow-md cursor-pointer min-w-[160px] sm:min-w-0">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{subject.icon}</span>
                      <p className="font-medium text-sm truncate">{subject.name}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{unitsPracticed}/{subject.units.length} units</span>
                      <span>{accuracy}%</span>
                    </div>
                    <Progress value={accuracy} className="h-1.5" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/bookmarks">
          <Card className="transition-all hover:shadow-md cursor-pointer">
            <CardContent className="p-3 text-center">
              <p className="text-lg mb-1">🔖</p>
              <p className="text-xs font-medium">Bookmarks</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/notes">
          <Card className="transition-all hover:shadow-md cursor-pointer">
            <CardContent className="p-3 text-center">
              <p className="text-lg mb-1">📝</p>
              <p className="text-xs font-medium">Notes</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics">
          <Card className="transition-all hover:shadow-md cursor-pointer">
            <CardContent className="p-3 text-center">
              <p className="text-lg mb-1">📊</p>
              <p className="text-xs font-medium">Analytics</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
