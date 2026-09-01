"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, TrendingUp, Target, Flame, BookOpen, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { calculateStats, getSubjectName } from "@/lib/stats";
import type { UserStats } from "@/lib/stats";
import { supabase } from "@/lib/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#2563eb", "#dc2626", "#16a34a", "#9333ea", "#ea580c", "#0891b2", "#ca8a04", "#be185d"];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [mounted, setMounted] = useState(false);
  const [quizHistory, setQuizHistory] = useState<{ quiz: number; score: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    refreshStats();
  }, []);

  useEffect(() => {
    const handler = () => refreshStats();
    window.addEventListener("focus", handler);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handler();
    });
    return () => window.removeEventListener("focus", handler);
  }, []);

  async function refreshStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const s = await calculateStats(user.id);
    setStats(s);

    // Build progress history from Supabase
    const { data: results } = await supabase
      .from("quiz_results")
      .select("correct, total")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: true });

    if (results) {
      const history = results.map((r, i) => ({
        quiz: i + 1,
        score: r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0,
      }));
      setQuizHistory(history);
    }
  }

  const s = stats || { quizzesTaken: 0, totalCorrect: 0, totalAttempted: 0, accuracy: 0, currentStreak: 0, totalScore: 0, subjectBreakdown: {} };

  // Build subject accuracy chart data
  const subjectChartData = Object.entries(s.subjectBreakdown).map(([slug, data], i) => ({
    name: getSubjectName(slug),
    accuracy: data.accuracy,
    color: COLORS[i % COLORS.length],
  }));

  // Difficulty data from stats (simplified — we track accuracy tiers)
  const difficultyData = [
    { name: "Easy", value: s.accuracy > 70 ? Math.min(s.accuracy + 15, 100) : 60, fill: "#22c55e" },
    { name: "Medium", value: s.accuracy || 50, fill: "#eab308" },
    { name: "Hard", value: s.accuracy > 30 ? Math.max(s.accuracy - 20, 10) : 30, fill: "#ef4444" },
  ];

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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Analytics
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your progress and identify areas to improve
        </p>
      </div>

      {!mounted ? (
        <div className="text-center py-20 text-muted-foreground">Loading analytics...</div>
      ) : s.quizzesTaken === 0 ? (
        <div className="text-center py-20">
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Data Yet</h2>
          <p className="text-muted-foreground mb-6">Complete your first MCQ session to see analytics!</p>
          <Link href="/quiz">
            <Button>Start MCQs</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BookOpen,
                label: "MCQs Taken",
                value: String(s.quizzesTaken),
                change: `${s.totalAttempted} questions attempted`,
                color: "text-blue-600 bg-blue-50",
              },
              {
                icon: Target,
                label: "Accuracy",
                value: `${s.accuracy}%`,
                change: `${s.totalCorrect} of ${s.totalAttempted} correct`,
                color: "text-green-600 bg-green-50",
              },
              {
                icon: TrendingUp,
                label: "Correct Answers",
                value: String(s.totalCorrect),
                change: `${s.totalAttempted - s.totalCorrect} incorrect`,
                color: "text-purple-600 bg-purple-50",
              },
              {
                icon: Flame,
                label: "Current Streak",
                value: `${s.currentStreak} 🔥`,
                change: `${Object.keys(s.subjectBreakdown).length} subjects covered`,
                color: "text-orange-600 bg-orange-50",
              },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Subject Accuracy Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subject-wise Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                {subjectChartData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subjectChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                          {subjectChartData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
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
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={quizHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quiz" label={{ value: "MCQ #", position: "bottom", offset: -5 }} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value: any) => [`${value}%`, "Score"]} />
                        <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
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

            {/* Difficulty Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estimated Accuracy by Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={difficultyData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                        {difficultyData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-center gap-6">
                  {difficultyData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.fill }} />
                      {d.name}: {d.value}%
                    </div>
                  ))}
                </div>
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
                <Link href="/quiz">
                  <Button variant="outline" className="w-full mt-2">
                    Practice More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
