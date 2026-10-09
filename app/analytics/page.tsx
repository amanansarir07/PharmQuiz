"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Target, Flame, BookOpen, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { calculateStats } from "@/lib/stats";
import { useAuth } from "@/lib/auth";
import { getSubjectName } from "@/data/registry";
import type { UserStats } from "@/lib/stats";
import { useActiveProgram } from "@/lib/program";
import { resolveResultProgram } from "@/lib/result-program";
import { AppEmpty, AppError, AppLoading } from "@/components/app-state";
import { supabase } from "@/lib/supabase/client";
import { LearningPage, PageHeading, StatTile } from "@/components/learning-ui";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,

} from "recharts";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [quizHistory, setQuizHistory] = useState<{ quiz: number; score: number }[]>([]);
  const [loadError, setLoadError] = useState(false);
  const { programSlug, program } = useActiveProgram();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    refreshStats();
  }, [programSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = () => refreshStats();
    window.addEventListener("focus", handler);
    const visHandler = () => {
      if (document.visibilityState === "visible") handler();
    };
    document.addEventListener("visibilitychange", visHandler);
    return () => {
      window.removeEventListener("focus", handler);
      document.removeEventListener("visibilitychange", visHandler);
    };
  }, [programSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  async function refreshStats() {
    setLoadError(false);
    // Show device progress while the cloud report is refreshing.
    void calculateStats(undefined, programSlug).then(setStats);
    if (typeof window !== "undefined") setQuizHistory(getHistoryFromLocalStorage());
    try {
      const userId = user?.id;

      // Get stats for the active programme (with localStorage fallback built in)
      const s = await calculateStats(userId, programSlug);
      setStats(s);

      // Build progress history from Supabase, fallback to localStorage
      let history: { quiz: number; score: number }[] = [];

      if (userId) {
        try {
          const rows = (r: { correct: number; total: number }[]) =>
            r.map((row, i) => ({
              quiz: i + 1,
              score: row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0,
            }));

          // Prefer the programme-scoped query (migration 008); fall back to a
          // plain select and filter in JS from the subject when the `program`
          // column doesn't exist yet.
          const scoped = await supabase
            .from("quiz_results")
            .select("correct, total, subject")
            .eq("user_id", userId)
            .eq("program", programSlug)
            .order("completed_at", { ascending: true });

          if (!scoped.error && scoped.data && scoped.data.length > 0) {
            history = rows(scoped.data);
          } else if (scoped.error) {
            const { data: results } = await supabase
              .from("quiz_results")
              .select("correct, total, subject")
              .eq("user_id", userId)
              .order("completed_at", { ascending: true });

            if (results && results.length > 0) {
              history = rows(
                results.filter(
                  (r) => resolveResultProgram(null, r.subject) === programSlug
                )
              );
            }
          }
        } catch {
          // Supabase query failed, fall through to localStorage
        }
      }

      // Fallback: load from localStorage if Supabase returned nothing
      if (history.length === 0 && typeof window !== "undefined") {
        history = getHistoryFromLocalStorage();
      }

      setQuizHistory(history);
    } catch (err) {
      console.error("Error refreshing analytics:", err);
      setLoadError(true);
      // Still try localStorage
      if (typeof window !== "undefined") {
        setQuizHistory(getHistoryFromLocalStorage());
      }
    }
  }

  function getHistoryFromLocalStorage(): { quiz: number; score: number }[] {
    type LocalResult = {
      config?: {
        program?: string;
        subject?: string;
        completedAt?: string;
      };
      answers: { isCorrect?: boolean }[];
      questions: unknown[];
    };
    const allResults: LocalResult[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("quiz-results-")) {
        try {
          const raw: unknown = JSON.parse(localStorage.getItem(key) || "{}");
          if (
            !raw ||
            typeof raw !== "object" ||
            !("answers" in raw) ||
            !Array.isArray(raw.answers) ||
            !("questions" in raw) ||
            !Array.isArray(raw.questions)
          ) {
            continue;
          }
          const result = raw as LocalResult;
          // Older results predate the programme field — resolve it from the
          // subject so previously-saved practice still charts.
          if (
            resolveResultProgram(result.config?.program, result.config?.subject || "") ===
              programSlug
          ) {
            allResults.push(result);
          }
        } catch {
          // skip
        }
      }
    }

    if (allResults.length === 0) return [];

    // Sort by completedAt ascending
    allResults.sort((a, b) => {
      const ta = a.config?.completedAt || "";
      const tb = b.config?.completedAt || "";
      return ta.localeCompare(tb);
    });

    return allResults.map((result, i) => {
      const correct = result.answers.filter((a) => a.isCorrect).length;
      const total = result.questions.length;
      return {
        quiz: i + 1,
        score: total > 0 ? Math.round((correct / total) * 100) : 0,
      };
    });
  }

  const s = stats || { quizzesTaken: 0, totalCorrect: 0, totalAttempted: 0, accuracy: 0, currentStreak: 0, totalScore: 0, subjectBreakdown: {} };

  // Build subject accuracy chart data
  const subjectChartData = Object.entries(s.subjectBreakdown).map(([slug, data]) => ({
    name: getSubjectName(slug),
    accuracy: data.accuracy,
    attempted: data.total,
  }));

  // Difficulty data - show empty state since we don't track per-difficulty stats yet

  // Weak topics
  const weakTopics = Object.entries(s.subjectBreakdown)
    .filter(([, data]) => data.accuracy < 70 && data.total >= 2)
    .sort((a, b) => a[1].accuracy - b[1].accuracy)
    .slice(0, 5)
    .map(([slug, data]) => ({
      subject: getSubjectName(slug),
      accuracy: data.accuracy,
      attempted: data.total,
    }));

  return (
    <LearningPage>
      <PageHeading eyebrow={program.shortLabel} title="Your progress" description="See what you have learned and where to focus next." />

      {stats === null ? (
        <AppLoading label="Loading your analytics" />
      ) : loadError ? (
        <AppError
          title="Analytics unavailable"
          description="We could not load your progress data. Please try again."
          onRetry={refreshStats}
        />
      ) : s.quizzesTaken === 0 ? (
        <AppEmpty
          title="No analytics yet"
          description="Complete your first MCQ session to see accuracy, streaks, and weak areas."
          action="Start MCQs"
          onAction={() => router.push("/quiz")}
        />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mb-7 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              {
                icon: BookOpen,
                label: "MCQs Taken",
                value: String(s.quizzesTaken),
                change: `${s.totalAttempted} questions attempted`,
                color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950",
              },
              {
                icon: Target,
                label: "Accuracy",
                value: `${s.accuracy}%`,
                change: `${s.totalCorrect} of ${s.totalAttempted} correct`,
                color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950",
              },
              {
                icon: TrendingUp,
                label: "Correct Answers",
                value: String(s.totalCorrect),
                change: `${s.totalAttempted - s.totalCorrect} incorrect`,
                color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950",
              },
              {
                icon: Flame,
                label: "Current Streak",
                value: `${s.currentStreak} 🔥`,
                change: `${Object.keys(s.subjectBreakdown).length} subjects covered`,
                color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950",
              },
            ].map((stat) => (
              <StatTile key={stat.label} label={stat.label} value={stat.value} detail={stat.change} tone={stat.label === "Accuracy" ? "green" : stat.label === "Current Streak" ? "amber" : "blue"} />
            ))}
            <StatTile label="Incorrect answers" value={s.totalAttempted - s.totalCorrect} tone="red" />
            <StatTile label="Subjects practised" value={Object.keys(s.subjectBreakdown).length} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Subject Accuracy Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subject-wise Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                {subjectChartData.length > 0 ? (
                  <div className="space-y-4">{subjectChartData.map((item) => <div key={item.name}><div className="mb-1 flex items-center justify-between gap-3 text-sm"><span className="min-w-0 truncate font-medium">{item.name}</span><span className="shrink-0 font-bold tabular-nums text-primary">{item.accuracy}%</span></div><Progress value={item.accuracy} className="h-2" /><p className="mt-1 text-[11px] text-muted-foreground">{item.attempted} questions attempted</p></div>)}</div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    Complete MCQs on different subjects to see accuracy
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {quizHistory.length > 1 ? (
                  <div className="h-[230px] sm:h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={quizHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quiz" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={20} />
                        <YAxis domain={[0, 100]} width={28} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip formatter={(value: unknown) => [`${String(value)}%`, "Score"]} />
                        <Line type="monotone" dataKey="score" stroke="#1555f0" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    Complete more MCQs to see your progress trend
                  </div>
                )}
              </CardContent>
            </Card>



            {/* Weak Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Weak Areas
                  {weakTopics.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      Needs Practice
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weakTopics.length > 0 ? (
                  weakTopics.map((topic, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{topic.subject}</p>
                        <span className="text-sm text-red-500 font-medium">{topic.accuracy}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{topic.attempted} questions attempted</p>
                      <Progress value={topic.accuracy} className="h-2" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No weak areas identified yet. Keep practicing!
                  </div>
                )}
                <Link
                  href="/quiz"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full mt-2 font-semibold")}
                >
                  Practice More
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </LearningPage>
  );
}
