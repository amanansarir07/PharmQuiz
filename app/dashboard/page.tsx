"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { subjects } from "@/data/subjects";
import { calculateStats, getSubjectName } from "@/lib/stats";
import type { UserStats } from "@/lib/stats";
import {
  BookOpen,
  Trophy,
  Target,
  Flame,
  ArrowRight,
  Brain,
  BarChart3,
  StickyNote,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Student";
  const [stats, setStats] = useState<UserStats | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(calculateStats());
  }, []);

  // Re-calculate stats whenever page becomes visible (after quiz completion)
  useEffect(() => {
    const handler = () => setStats(calculateStats());
    window.addEventListener("focus", handler);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handler();
    });
    return () => window.removeEventListener("focus", handler);
  }, []);

  const s = stats || { quizzesTaken: 0, totalCorrect: 0, totalAttempted: 0, accuracy: 0, currentStreak: 0, totalScore: 0, subjectBreakdown: {} };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="mt-2 text-muted-foreground">
          Continue your pharmacy exam preparation
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: BookOpen, label: "Quizzes Taken", value: mounted ? String(s.quizzesTaken) : "0", color: "text-blue-600 bg-blue-50" },
          { icon: Target, label: "Accuracy", value: mounted ? (s.totalAttempted > 0 ? `${s.accuracy}%` : "—") : "—", color: "text-green-600 bg-green-50" },
          { icon: Flame, label: "Study Streak", value: mounted ? `${s.currentStreak} day${s.currentStreak !== 1 ? "s" : ""}` : "0 days", color: "text-orange-600 bg-orange-50" },
          { icon: Trophy, label: "Total Score", value: mounted ? String(s.totalScore) : "0", color: "text-yellow-600 bg-yellow-50" },
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

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link href="/quiz">
          <Card className="transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Start Quiz</p>
                <p className="text-sm text-muted-foreground">
                  Choose subject and start practicing
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics">
          <Card className="transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold">View Analytics</p>
                <p className="text-sm text-muted-foreground">
                  Track your progress
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/notes">
          <Card className="transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50">
                <StickyNote className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold">My Notes</p>
                <p className="text-sm text-muted-foreground">
                  Review your study notes
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        {isAdmin && (
          <Link href="/admin">
            <Card className="transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold">Admin Panel</p>
                  <p className="text-sm text-muted-foreground">
                    Manage questions & users
                  </p>
                </div>
                <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        )}
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

      {/* Recent Activity */}
      {mounted && s.quizzesTaken > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-8 mb-4">Quick Summary</h2>
          <Card>
            <CardContent className="p-5">
              <div className="grid gap-4 sm:grid-cols-3 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">{s.totalCorrect}</p>
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-500">{s.totalAttempted - s.totalCorrect}</p>
                  <p className="text-sm text-muted-foreground">Incorrect Answers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-muted-foreground">{Object.keys(s.subjectBreakdown).length}</p>
                  <p className="text-sm text-muted-foreground">Subjects Covered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
