"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { subjects } from "@/data/subjects";
import { safeSetItem } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import {
  fetchUpcomingExams,
  formatInKathmandu,
  isExamLive,
  scheduledMockConfig,
  type MockExam,
} from "@/lib/mock-exams";
import {
  Timer,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Eye,
  Play,
  ArrowLeft,
  GraduationCap,
  CalendarClock,
  Megaphone,
} from "lucide-react";

export default function MockTestPage() {
  const router = useRouter();
  const [exams, setExams] = useState<MockExam[]>([]);
  const [now, setNow] = useState(() => new Date());
  const { isAdmin } = useAuth();

  // Load scheduled exams once; refresh the clock every 30s so LIVE and
  // "starts in..." states stay honest without hammering Supabase.
  useEffect(() => {
    let alive = true;
    fetchUpcomingExams().then((list) => {
      if (alive) setExams(list);
    });
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const timeTo = (exam: MockExam, now: Date): string | null => {
    const diff = new Date(exam.starts_at).getTime() - now.getTime();
    if (diff <= 0) return null;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ${mins % 60}m`;
    return `${Math.floor(hrs / 24)}d ${hrs % 24}h`;
  };

  const startMockTest = (exam?: MockExam) => {
    const sessionId = crypto.randomUUID();
    const config = exam
      ? scheduledMockConfig(exam)
      : {
          mode: "mock",
          difficulty: "mixed",
          numQuestions: 10 * subjects.length,
          timeLimit: 80, // minutes — 1 min per question
          negativeMarking: false,
          revisionMode: false,
        };
    safeSetItem(`quiz-config-${sessionId}`, JSON.stringify(config));
    router.push(`/quiz/${sessionId}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <ClipboardList className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Full Mock Test</h1>
          <p className="mt-1 text-muted-foreground">
            One complete exam-style paper across all {subjects.length} subjects — exactly like the real thing.
          </p>
        </div>
      </div>


      {/* Scheduled exams */}
      {exams.length > 0 && (
        <Card className="mb-6 border-primary/25">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Megaphone className="h-4 w-4 text-primary" />
                Scheduled Mock Exams
              </h2>
              {isAdmin && (
                <Link
                  href="/admin/mock-exams"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Manage schedule
                </Link>
              )}
            </div>
            <div className="space-y-3">
              {exams.map((exam) => {
                const live = isExamLive(exam, now);
                const startsLabel = timeTo(exam, now);
                return (
                  <div
                    key={exam.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{exam.title}</p>
                        {live ? (
                          <Badge className="bg-green-600 text-white">
                            ● LIVE NOW
                          </Badge>
                        ) : startsLabel ? (
                          <Badge variant="secondary">
                            Starts {startsLabel}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Starts soon</Badge>
                        )}
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatInKathmandu(exam.starts_at)} (Kathmandu)
                        <span aria-hidden>·</span>
                        {exam.duration_minutes} min
                        <span aria-hidden>·</span>
                        8 subjects × 10 questions
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={!live}
                      onClick={() => startMockTest(exam)}
                    >
                      <Play className="mr-1 h-4 w-4" />
                      {live ? "Start Exam Now" : "Opens at start time"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exam format */}
      <Card className="mb-6">
        <CardContent className="p-5 sm:p-6">
          <h2 className="mb-4 text-base font-semibold">Exam Format</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-muted/60 p-4 text-center">
              <p className="text-2xl font-bold">{subjects.length * 10}</p>
              <p className="mt-1 text-xs text-muted-foreground">Questions</p>
            </div>
            <div className="rounded-xl bg-muted/60 p-4 text-center">
              <p className="text-2xl font-bold">{subjects.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Subjects</p>
            </div>
            <div className="rounded-xl bg-muted/60 p-4 text-center">
              <p className="text-2xl font-bold">10</p>
              <p className="mt-1 text-xs text-muted-foreground">Per Subject</p>
            </div>
            <div className="rounded-xl bg-muted/60 p-4 text-center">
              <p className="text-2xl font-bold">80</p>
              <p className="mt-1 text-xs text-muted-foreground">Minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects covered */}
      <Card className="mb-6">
        <CardContent className="p-5 sm:p-6">
          <h2 className="mb-4 text-base font-semibold">Covered Subjects</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {subjects.map((s) => (
              <div
                key={s.slug}
                className="flex items-center gap-2 rounded-lg border p-2.5 text-sm"
              >
                <span className="text-base">{s.icon}</span>
                <span className="truncate font-medium">{s.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rules */}
      <Card className="mb-8">
        <CardContent className="p-5 sm:p-6">
          <h2 className="mb-4 text-base font-semibold">Test Instructions</h2>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Timer className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              You have <strong className="mx-1">80 minutes</strong> for all {subjects.length * 10} questions. The test submits automatically when time runs out.
            </li>
            <li className="flex items-start gap-2">
              <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Questions are grouped subject-by-subject, like the real board paper.
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              No negative marking — attempt every question.
            </li>
            <li className="flex items-start gap-2">
              <Eye className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Answers and explanations appear only after you submit.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Progress auto-saves — if the page refreshes, you resume where you left off.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Button size="lg" className="w-full" onClick={() => startMockTest()}>
        <Play className="mr-2 h-5 w-5" />
        Start Mock Test
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {subjects.length * 10} random questions are picked fresh each time you start.
      </p>
    </div>
  );
}
