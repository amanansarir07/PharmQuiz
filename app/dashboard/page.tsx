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

  // Re-calculate stats whenever page becomes visible (after quiz completion)
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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-pulse">
        <div className="mb-8 space-y-2">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-6 w-10 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-36 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 bg-muted rounded" />
                  <div className="h-4 w-20 bg-muted rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-2 w-full bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const s = stats || { quizzesTaken: 0, totalCorrect: 0, totalAttempted: 0, accuracy: 0, currentStreak: 0, totalScore: 0, subjectBreakdown: {} };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Continue your pharmacy exam preparation
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: BookOpen, label: "MCQs Taken", value: mounted ? String(s.quizzesTaken) : "0", color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950" },
          { icon: Target, label: "Accuracy", value: mounted ? (s.totalAttempted > 0 ? `${s.accuracy}%` : "—") : "—", color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950" },
          { icon: Flame, label: "Study Streak", value: mounted ? `${s.currentStreak} day${s.currentStreak !== 1 ? "s" : ""}` : "0 days", color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950" },
          { icon: Trophy, label: "Total Score", value: mounted ? String(s.totalScore) : "0", color: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Link href="/history" className="text-sm text-primary hover:underline">
            View All History
          </Link>
        </div>
        {(() => {
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
          const recent = recentResults.slice(0, 5);

          if (recent.length === 0) {
            return (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No quizzes taken yet</p>
                  <Link href="/quiz">
                    <Button className="mt-3" size="sm">Start Your First Quiz</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          }

          const subjectNames: Record<string, string> = {
            "pharmacology-i": "Pharmacology I",
            "pharmaceutics-i": "Pharmaceutics I",
            "pharmaceutical-management": "Pharmaceutical Management",
            "public-health-pharmacy": "Public Health Pharmacy",
            "pharmacognosy": "Pharmacognosy",
            "biochemistry-microbiology": "Biochemistry & Microbiology",
            "pharmaceutical-chemistry-i": "Pharmaceutical Chemistry I",
            "pharmacotherapeutics-i": "Pharmacotherapeutics I",
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
            <div className="space-y-3">
              {recent.map((r) => (
                <Link key={r.sessionId} href={"/quiz/" + r.sessionId + "/results"}>
                  <Card className="transition-all hover:shadow-md cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={"flex h-10 w-10 items-center justify-center rounded-lg " + (r.accuracy >= 70 ? "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400" : r.accuracy >= 50 ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400" : "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400")}>
                        <Brain className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{subjectNames[r.subject] || r.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.score}/{r.total} correct · {fmtTime(r.date)}
                        </p>
                      </div>
                      <Badge variant={r.accuracy >= 70 ? "default" : r.accuracy >= 50 ? "secondary" : "destructive"}>
                        {r.accuracy}%
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Subject Progress */}
      <h2 className="text-xl font-semibold mb-4">Subject Progress</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {subjects.map((subject) => {
          const breakdown = mounted ? s.subjectBreakdown[subject.slug] : null;
          const unitsPracticed = breakdown ? Math.min(Math.ceil((breakdown.total / 10)), subject.units.length) : 0;
          const pct = subject.units.length > 0 ? Math.round((unitsPracticed / subject.units.length) * 100) : 0;

          return (
            <Link key={subject.id} href={`/subjects/${subject.slug}`}>
              <Card className="transition-all hover:shadow-md cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{subject.icon}</span>
                    <p className="font-medium text-sm">{subject.name}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{unitsPracticed} / {subject.units.length} units practiced</span>
                      <span>{breakdown ? `${breakdown.accuracy}%` : "0%"}</span>
                    </div>
                    <Progress value={breakdown ? breakdown.accuracy : 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
