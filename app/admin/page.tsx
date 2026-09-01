"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { subjects } from "@/data/subjects";
import { getQuestionCount, getQuestionsForQuiz } from "@/lib/quiz-loader";
import { supabase } from "@/lib/supabase/client";

export default function AdminPage() {
  const [userCount, setUserCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadStats() {
      // Count registered users from Supabase
      const { count: userCountResult } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      setUserCount(userCountResult || 0);

      // Count quizzes taken from Supabase
      const { count: quizCountResult } = await supabase
        .from("quiz_results")
        .select("*", { count: "exact", head: true });
      setQuizCount(quizCountResult || 0);

      // Count questions from JSON
      const total = getQuestionCount();
      setTotalQuestions(total);

      // Count per subject
      const counts: Record<string, number> = {};
      for (const s of subjects) {
        counts[s.slug] = getQuestionsForQuiz(s.slug).length;
      }
      setSubjectCounts(counts);
    }
    loadStats();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Panel
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage questions, users, and platform settings
          </p>
        </div>
        <Link href="/admin/questions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Users, label: "Registered Users", value: String(userCount), color: "text-blue-600 bg-blue-50" },
          { icon: HelpCircle, label: "Total Questions", value: String(totalQuestions), color: "text-green-600 bg-green-50" },
          { icon: TrendingUp, label: "MCQs Taken", value: String(quizCount), color: "text-purple-600 bg-purple-50" },
          { icon: BookOpen, label: "Subjects", value: String(subjects.length), color: "text-orange-600 bg-orange-50" },
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

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/questions">
          <Card className="transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <HelpCircle className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">Manage Questions</p>
                <p className="text-sm text-muted-foreground">
                  View and manage all {totalQuestions} questions
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/questions/new">
          <Card className="transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <Plus className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold">Add New Question</p>
                <p className="text-sm text-muted-foreground">
                  Create a new MCQ for the bank
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/leaderboard">
          <Card className="transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-semibold">View Users</p>
                <p className="text-sm text-muted-foreground">
                  See registered users and rankings
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Questions by Subject */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Questions by Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.units.length} units
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{subjectCounts[s.slug] || 0} questions</span>
                  <Link href={`/admin/questions?subject=${s.slug}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
