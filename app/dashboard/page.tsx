"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getSubjectName, getSubjectsForProgram } from "@/data/registry";
import { safeSetItem, getCoveredUnitIds } from "@/lib/storage";
import {
  fetchUpcomingExams,
  formatCountdown,
  formatInKathmandu,
  getMockQuestionCount,
  getMockSubjectCount,
  isExamLive,
  scheduledMockConfig,
  type MockExam,
} from "@/lib/mock-exams";
import { calculateStats } from "@/lib/stats";
import type { UserStats } from "@/lib/stats";
import { useActiveProgram } from "@/lib/program";
import { getQuizHistory, type HistoryEntry } from "@/lib/history";
import { getMistakesCount, createMistakesSession } from "@/lib/mistakes";
import {
  BookOpen,
  Trophy,
  Target,
  Flame,
  Brain,
  Play,
  Timer,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Megaphone,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Layers,
  FileText,
  CheckCircle2,
  Bookmark,
  Keyboard,
  Compass,
  Clock,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { OnboardingDepartmentModal } from "@/components/onboarding-department-modal";

type DashboardPillar = "study" | "practice" | "progress";

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const firstName = user?.name?.split(" ")[0] || "Student";
  const { programSlug, program, setProgramSlug } = useActiveProgram();
  const subjects = useMemo(
    () => getSubjectsForProgram(programSlug),
    [programSlug]
  );

  const [activePillar, setActivePillar] = useState<DashboardPillar>("practice");
  const [expandedSubject, setExpandedSubject] = useState<string | null>(
    subjects[0]?.slug || null
  );
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recent, setRecent] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [exams, setExams] = useState<MockExam[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [mistakesCount, setMistakesCount] = useState<number>(0);

  // Scheduled mock announcements
  useEffect(() => {
    let alive = true;
    fetchUpcomingExams(programSlug).then((list) => {
      if (alive) setExams(list);
    });
    return () => {
      alive = false;
    };
  }, [programSlug]);

  useEffect(() => {
    if (exams.length === 0) return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [exams.length]);

  const startScheduled = (exam: MockExam) => {
    const sessionId = crypto.randomUUID();
    safeSetItem(
      `quiz-config-${sessionId}`,
      JSON.stringify(scheduledMockConfig(exam, programSlug))
    );
    router.push(`/quiz/${sessionId}`);
  };

  const refreshData = useCallback(async () => {
    if (!user) return;
    const [s, h] = await Promise.all([
      calculateStats(user.id, programSlug),
      getQuizHistory(user.id),
    ]);
    setStats(s);
    setRecent(h.filter((e) => e.program === programSlug).slice(0, 5));
    setMistakesCount(getMistakesCount(programSlug));
  }, [user, programSlug]);

  useEffect(() => {
    setMounted(true);
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    const handler = () => refreshData();
    window.addEventListener("focus", handler);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handler();
    });
    return () => window.removeEventListener("focus", handler);
  }, [refreshData]);

  // Start instant unit practice
  const handleStartUnitQuiz = (subjectSlug: string, unitId: string) => {
    const sessionId = crypto.randomUUID();
    const config = {
      subject: subjectSlug,
      units: [unitId],
      difficulty: "mixed",
      numQuestions: 10,
      timeLimit: 15,
      negativeMarking: false,
      program: programSlug,
    };
    safeSetItem(`quiz-config-${sessionId}`, JSON.stringify(config));
    router.push(`/quiz/${sessionId}`);
  };

  // Start Mistakes revision session
  const handleStartMistakesQuiz = () => {
    const sessionId = createMistakesSession(programSlug);
    if (sessionId) {
      router.push(`/quiz/${sessionId}`);
    }
  };

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

  const s = stats || {
    quizzesTaken: 0,
    totalCorrect: 0,
    totalAttempted: 0,
    accuracy: 0,
    currentStreak: 0,
    totalScore: 0,
    subjectBreakdown: {},
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
      {/* Auto-Prompt for Department Selection if Unset */}
      <OnboardingDepartmentModal />

      {/* ================= HEADER & QUICK STATUS ================= */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hi, {firstName} 👋
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <span>{program.icon}</span>
              {program.shortLabel}
            </span>
            <span>•</span>
            <span>
              {program.facultySlug === "ctevt"
                ? "CTEVT Health Sciences"
                : "+2 Higher Secondary (NEB)"}
            </span>
            <Link
              href="/programs"
              className="text-xs text-primary hover:underline ml-1"
            >
              (Switch Department)
            </Link>
          </div>
        </div>

        {/* Quick Streak & Performance Ribbon */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border bg-card px-3 py-1.5 text-xs font-semibold shadow-sm">
            <Flame className="h-4 w-4 text-orange-500" />
            <span>{s.currentStreak} Day Streak</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border bg-card px-3 py-1.5 text-xs font-semibold shadow-sm">
            <Target className="h-4 w-4 text-emerald-500" />
            <span>{s.totalAttempted > 0 ? `${s.accuracy}% Accuracy` : "New Learner"}</span>
          </div>
          {mistakesCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{mistakesCount} Mistakes</span>
            </div>
          )}
        </div>
      </div>

      {/* ================= ACTIVE DEVELOPMENT NOTICE ================= */}
      {!program.hasContent && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/[0.08] via-card to-card p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg">
                    {program.name} is in Active Development
                  </h3>
                  <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-400">
                    Phase 2: Question Authoring
                  </Badge>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xl">
                  You are registered in <strong>{program.name}</strong>. While full question banks are being authored, you can explore the syllabus specification or practice on live D.Pharm Year 3 or Year 2 question banks.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/programs/${program.slug}`}>
                <Button size="sm" className="gap-1.5 font-medium bg-primary">
                  <BookOpen className="h-4 w-4" />
                  View Syllabus Roadmap
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProgramSlug("d-pharm-y3")}
                className="gap-1.5 font-medium"
              >
                Switch to D.Pharm Y3 (Live)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProgramSlug("d-pharm-y2")}
                className="gap-1.5 font-medium"
              >
                Switch to D.Pharm Y2 (Live)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2-COLUMN RESPONSIVE WEB-APP WORKSPACE ================= */}
      <div className="grid gap-8 lg:grid-cols-[1fr_340px] items-start">
        {/* Left Column: Active Pillar Workspace */}
        <div className="min-w-0 space-y-6">
          {/* ================= 3-PILLAR NAVIGATION TABS ================= */}
          <div className="rounded-2xl border bg-muted/40 p-1.5 shadow-xs">
            <nav className="grid grid-cols-3 gap-1.5" aria-label="Dashboard Pillars">
          <button
            type="button"
            onClick={() => setActivePillar("study")}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
              activePillar === "study"
                ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span>Study</span>
            <span className="hidden sm:inline text-xs font-normal text-muted-foreground">
              (Subject &middot; Chapter &middot; Topic)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActivePillar("practice")}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
              activePillar === "practice"
                ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
            }`}
          >
            <Target className="h-4 w-4 text-emerald-500" />
            <span>Practice</span>
            <span className="hidden sm:inline text-xs font-normal text-muted-foreground">
              (Quiz &middot; Mocks &middot; Mistakes)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActivePillar("progress")}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
              activePillar === "progress"
                ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
            }`}
          >
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span>Progress</span>
            <span className="hidden sm:inline text-xs font-normal text-muted-foreground">
              (Analytics &middot; Rank)
            </span>
          </button>
        </nav>
      </div>

      {/* ================= PILLAR 1: STUDY ================= */}
      {/* Hierarchy: Subject -> Chapter (Unit) -> Topic (Subtopic) */}
      {activePillar === "study" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Curriculum Syllabus & Units</h2>
              <p className="text-sm text-muted-foreground">
                Browse subjects, chapters, and subtopics with direct unit practice.
              </p>
            </div>
            <Link href="/notes" className="text-xs font-medium text-primary hover:underline">
              Open Study Notes →
            </Link>
          </div>

          {subjects.length === 0 ? (
            <Card className="border-dashed p-8 text-center bg-card/60">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="font-bold text-lg">{program.name} Syllabus Preview</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-5">
                The full chapter curriculum, credit hour allocation, and course roadmap for {program.name} are available on its curriculum specification page.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href={`/programs/${program.slug}`}>
                  <Button className="gap-2 bg-primary font-semibold">
                    <BookOpen className="h-4 w-4" />
                    Open Curriculum Roadmap
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setProgramSlug("d-pharm-y3")}
                  className="gap-2"
                >
                  Practise D.Pharm Year 3 (Live)
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {subjects.map((subject) => {
              const isExpanded = expandedSubject === subject.slug;
              return (
                <Card key={subject.id} className="overflow-hidden transition-all">
                  <div
                    onClick={() =>
                      setExpandedSubject(isExpanded ? null : subject.slug)
                    }
                    className="flex cursor-pointer items-center justify-between p-4 sm:p-5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{subject.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base sm:text-lg">
                            {subject.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {subject.units.length} Units
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {subject.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex flex-col text-right text-xs text-muted-foreground">
                        <span>{subject.examMarks} Marks</span>
                        <span>{subject.totalHours} Hours</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Chapters (Units) and Topics */}
                  {isExpanded && (
                    <div className="border-t bg-muted/15 p-4 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>Chapters & Syllabus Units</span>
                        <Link
                          href={`/subjects/${subject.slug}`}
                          className="text-primary hover:underline"
                        >
                          View Full Subject →
                        </Link>
                      </div>

                      <div className="grid gap-3">
                        {subject.units.map((unit, idx) => (
                          <div
                            key={unit.id}
                            className="rounded-xl border bg-card p-4 shadow-sm"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-[11px]">
                                    Unit {idx + 1}
                                  </Badge>
                                  <h4 className="font-semibold text-sm sm:text-base">
                                    {unit.name}
                                  </h4>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {unit.description}
                                </p>

                                {/* Topics (Subtopics) List */}
                                {unit.subtopics && unit.subtopics.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                                      Key Topics:
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {unit.subtopics.map((topic) => (
                                        <span
                                          key={topic}
                                          className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                                        >
                                          • {topic}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0">
                                <div className="text-right text-xs text-muted-foreground">
                                  <span>{unit.examMarks} Marks</span>
                                  <span className="hidden sm:inline"> &middot; {unit.examHours}h</span>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleStartUnitQuiz(subject.slug, unit.id)}
                                  className="gap-1.5 text-xs font-semibold"
                                >
                                  <Play className="h-3.5 w-3.5" />
                                  Practice Unit
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
        </div>
      )}

      {/* ================= PILLAR 2: PRACTICE ================= */}
      {/* 3 Core Modes: Quiz | Mock Test | Mistakes */}
      {activePillar === "practice" && (
        <div className="space-y-6">

          {/* Scheduled Mock Notice (Live / Upcoming) */}
          {exams.length > 0 && (
            <div className="space-y-3">
              {exams.map((exam) => {
                const live = isExamLive(exam, now);
                return live ? (
                  <Card
                    key={exam.id}
                    className="border-green-500/50 bg-green-50 dark:bg-green-950/40"
                  >
                    <CardContent className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-600/15 text-green-600 dark:text-green-400">
                        <Megaphone className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">Mock Test is LIVE now!</p>
                          <Badge className="bg-green-600 text-white">● LIVE</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {exam.title} · {formatInKathmandu(exam.starts_at, "short")} · {exam.duration_minutes} min
                        </p>
                      </div>
                      <Button onClick={() => startScheduled(exam)}>
                        <Play className="mr-1.5 h-4 w-4" />
                        Start Exam Now
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Link key={exam.id} href="/mock-test" className="block">
                    <Card className="cursor-pointer border-primary/40 bg-primary/5 transition-all hover:shadow-md">
                      <CardContent className="flex flex-wrap items-center gap-3 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                          <Megaphone className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">Scheduled Board Mock Test</p>
                            <Badge variant="secondary" className="text-[10px]">Upcoming</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {exam.title} · {formatInKathmandu(exam.starts_at, "short")}
                          </p>
                          <p className="text-xs font-semibold text-primary mt-0.5">
                            Starts in {formatCountdown(exam.starts_at, now)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          {/* 3 Main Practice Mode Cards */}
          <div className="grid gap-5 md:grid-cols-3">

            {/* Mode 1: Custom Practice Drill */}
            <Card className="flex flex-col justify-between overflow-hidden border-2 hover:border-primary/60 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">1. Custom Practice Drill</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Select your subject, isolate syllabus units, and customize question counts and timers.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                  <span className="rounded-md bg-muted px-2 py-0.5">10–50 Questions</span>
                  <span className="rounded-md bg-muted px-2 py-0.5">Unit Selection</span>
                  <span className="rounded-md bg-muted px-2 py-0.5">Instant Review</span>
                </div>
              </CardContent>
              <div className="border-t p-4 bg-muted/15">
                <Link
                  href="/quiz"
                  className={cn(buttonVariants({ variant: "default" }), "w-full gap-2 font-semibold")}
                >
                  Start Practice Drill
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>

            {/* Mode 2: Full Board Mock */}
            <Card className="flex flex-col justify-between overflow-hidden border-2 hover:border-primary/60 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                  <Timer className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">2. Full Board Mock Test</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete 80-question / 80-minute paper simulating official CTEVT board exam rules.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                  <span className="rounded-md bg-muted px-2 py-0.5">80 Questions</span>
                  <span className="rounded-md bg-muted px-2 py-0.5">8 Subjects</span>
                  <span className="rounded-md bg-muted px-2 py-0.5">Official Timing</span>
                </div>
              </CardContent>
              <div className="border-t p-4 bg-muted/15">
                <Link
                  href="/mock-test"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2 font-semibold")}
                >
                  Enter Board Mock Test
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>

            {/* Mode 3: Mistakes Revision */}
            <Card className={`flex flex-col justify-between overflow-hidden border-2 transition-all hover:shadow-lg ${
              mistakesCount > 0 ? "border-amber-500/50 bg-amber-500/[0.02]" : "hover:border-primary/60"
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <RotateCcw className="h-6 w-6" />
                  </div>
                  {mistakesCount > 0 ? (
                    <Badge className="bg-amber-500 text-white font-bold">
                      {mistakesCount} Unresolved
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      All Clear
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold">3. Mistakes Revision Bank</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {mistakesCount > 0
                    ? `You have ${mistakesCount} questions missed in previous tests. Re-drill them to convert weak spots into strengths.`
                    : "Zero unresolved mistakes! Future questions you miss in practice will automatically collect here."}
                </p>
              </CardContent>
              <div className="border-t p-4 bg-muted/15">
                <Button
                  onClick={handleStartMistakesQuiz}
                  disabled={mistakesCount === 0}
                  className="w-full gap-2 font-semibold bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Drill Missed Questions
                </Button>
              </div>
            </Card>

          </div>

          {/* Quick Subject Launchers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">Quick Practice by Subject</h3>
              <Link href="/subjects" className="text-xs text-primary hover:underline">
                All Subjects →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {subjects.slice(0, 4).map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    const sessionId = crypto.randomUUID();
                    safeSetItem(
                      `quiz-config-${sessionId}`,
                      JSON.stringify({
                        subject: sub.slug,
                        units: [],
                        difficulty: "mixed",
                        numQuestions: 10,
                        timeLimit: 15,
                        program: programSlug,
                      })
                    );
                    router.push(`/quiz/${sessionId}`);
                  }}
                  className="flex items-center gap-2.5 rounded-xl border bg-card p-3 text-left transition-all hover:border-primary hover:shadow-sm"
                >
                  <span className="text-xl">{sub.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{sub.name}</p>
                    <p className="text-[10px] text-muted-foreground">10 Quick MCQs</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================= PILLAR 3: PROGRESS ================= */}
      {/* Stats, Subject Breakdown, Leaderboard, History */}
      {activePillar === "progress" && (
        <div className="space-y-6">

          {/* Summary Stat Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                icon: BookOpen,
                label: "Quizzes Taken",
                value: mounted ? String(s.quizzesTaken) : "0",
                color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950",
              },
              {
                icon: Target,
                label: "Overall Accuracy",
                value: mounted ? (s.totalAttempted > 0 ? `${s.accuracy}%` : "--") : "--",
                color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950",
              },
              {
                icon: Flame,
                label: "Current Streak",
                value: mounted ? `${s.currentStreak} Days` : "0 Days",
                color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950",
              },
              {
                icon: Trophy,
                label: "Total Score",
                value: mounted ? String(s.totalScore) : "0",
                color: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950",
              },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-bold leading-tight mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Subject Mastery Breakdown */}
          <Card>
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base">Subject Mastery Breakdown</h3>
                <Link href="/analytics" className="text-xs text-primary hover:underline">
                  Full Analytics →
                </Link>
              </div>

              <div className="space-y-3">
                {subjects.map((subject) => {
                  const breakdown = mounted ? s.subjectBreakdown[subject.slug] : null;
                  const localUnits = breakdown ? getCoveredUnitIds(subject.slug) : null;
                  const unitsPracticed = breakdown
                    ? Math.min(
                        localUnits ? localUnits.size : Math.ceil(breakdown.total / 10),
                        subject.units.length
                      )
                    : 0;
                  const accuracy = breakdown && breakdown.total > 0 ? breakdown.accuracy : 0;

                  return (
                    <div key={subject.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium flex items-center gap-1.5">
                          <span>{subject.icon}</span>
                          {subject.name}
                        </span>
                        <span className="text-muted-foreground font-semibold">
                          {breakdown ? `${accuracy}% (${unitsPracticed}/${subject.units.length} units)` : "Not practiced"}
                        </span>
                      </div>
                      <Progress value={breakdown ? accuracy : 0} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard CTA & Position */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Curriculum Leaderboard</h4>
                  <p className="text-xs text-muted-foreground">
                    Compete fairly with students in {program.shortLabel}. Daily, Weekly &amp; All-Time boards.
                  </p>
                </div>
              </div>
              <Link
                href="/leaderboard"
                className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5 font-semibold")}
              >
                View Leaderboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          {/* Recent Quiz Activity */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base">Recent Quiz History</h3>
              <Link href="/history" className="text-xs text-primary hover:underline">
                View All Attempts →
              </Link>
            </div>

            {recent.length > 0 ? (
              <div className="space-y-2">
                {recent.map((r) => {
                  const accuracy = r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0;
                  const inner = (
                    <Card className="transition-all hover:shadow-md cursor-pointer">
                      <CardContent className="p-3.5 flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${
                            accuracy >= 70
                              ? "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400"
                              : accuracy >= 50
                              ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400"
                              : "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {accuracy}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{getSubjectName(r.subject)}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.correct}/{r.total} correct &middot; {fmtTime(r.completedAt)}
                          </p>
                        </div>
                        {r.hasLocalDetail && r.localSessionId && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </CardContent>
                    </Card>
                  );

                  return r.hasLocalDetail && r.localSessionId ? (
                    <Link key={r.key} href={`/quiz/${r.localSessionId}/results`}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={r.key}>{inner}</div>
                  );
                })}
              </div>
            ) : (
              <Card className="border-dashed p-6 text-center text-muted-foreground text-sm">
                No quiz sessions recorded yet. Start practicing above!
              </Card>
            )}
          </div>

        </div>
      )}

          {/* Mobile-only Quick Utilities (hidden on desktop since companion sidebar contains them) */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-t pt-6 lg:hidden">
            <Link href="/bookmarks">
              <Card className="transition-all hover:shadow-md cursor-pointer">
                <CardContent className="p-3 text-center">
                  <p className="text-lg mb-1">🔖</p>
                  <p className="text-xs font-semibold">Bookmarks</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/notes">
              <Card className="transition-all hover:shadow-md cursor-pointer">
                <CardContent className="p-3 text-center">
                  <p className="text-lg mb-1">📝</p>
                  <p className="text-xs font-semibold">Notes</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/analytics">
              <Card className="transition-all hover:shadow-md cursor-pointer">
                <CardContent className="p-3 text-center">
                  <p className="text-lg mb-1">📊</p>
                  <p className="text-xs font-semibold">Analytics</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Column: Desktop Sticky Companion Sidebar */}
        <aside className="hidden lg:flex flex-col gap-5 sticky top-20">
          {/* 1. Daily Habit & Streak Card */}
          <Card className="overflow-hidden border bg-card shadow-xs">
            <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Study Streak</h3>
                    <p className="text-[11px] text-muted-foreground">Daily Practice Habit</p>
                  </div>
                </div>
                <Badge variant="outline" className="font-bold text-orange-600 dark:text-orange-400 border-orange-500/30 bg-orange-500/5">
                  {s.currentStreak} {s.currentStreak === 1 ? "Day" : "Days"}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Overall Accuracy</span>
                <span className="font-bold">{s.totalAttempted > 0 ? `${s.accuracy}%` : "Not enough data"}</span>
              </div>
              <Progress value={s.accuracy || 0} className="h-2" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Complete at least 1 practice session today to build momentum and rank higher on the leaderboard.
              </p>
            </CardContent>
          </Card>

          {/* 2. Quick Mistakes Bank Card */}
          <Card className={cn(
            "overflow-hidden border transition-all shadow-xs",
            mistakesCount > 0 ? "border-amber-500/40 bg-amber-500/[0.02]" : "border-border"
          )}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    mistakesCount > 0 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  )}>
                    {mistakesCount > 0 ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <h3 className="font-semibold text-sm">Mistakes Bank</h3>
                </div>
                {mistakesCount > 0 ? (
                  <Badge className="bg-amber-600 text-white text-[11px]">
                    {mistakesCount} Unresolved
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[11px] text-emerald-600 border-emerald-500/30">
                    All Clean
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {mistakesCount > 0
                  ? "Questions you missed in recent quizzes are stored here for targeted re-drills."
                  : "Great job! You have zero unresolved mistakes from past quizzes."}
              </p>
              {mistakesCount > 0 && (
                <Button
                  size="sm"
                  onClick={handleStartMistakesQuiz}
                  className="w-full gap-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Drill Mistakes ({mistakesCount})
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 3. Board Mock Countdown */}
          {exams.length > 0 ? (
            <Card className="border-primary/30 bg-primary/[0.02] shadow-xs">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-sm">Board Mock Exam</h3>
                  </div>
                  {isExamLive(exams[0], now) ? (
                    <Badge className="bg-green-600 text-white text-[10px] animate-pulse">● LIVE</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">Upcoming</Badge>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium truncate">{exams[0].title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatInKathmandu(exams[0].starts_at, "short")}
                  </p>
                </div>
                {isExamLive(exams[0], now) ? (
                  <Button size="sm" onClick={() => startScheduled(exams[0])} className="w-full text-xs font-semibold">
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                    Take Exam Now
                  </Button>
                ) : (
                  <div className="rounded-lg bg-muted/60 p-2 text-center text-xs font-semibold text-primary">
                    Starts in {formatCountdown(exams[0].starts_at, now)}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border bg-card shadow-xs">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Timer className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-sm">Full Board Mock</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  80 MCQs timed paper covering all {subjects.length} subjects under real board exam conditions.
                </p>
                <Link
                  href="/mock-test"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full text-xs font-semibold")}
                >
                  Go to Mock Test →
                </Link>
              </CardContent>
            </Card>
          )}

          {/* 4. Desktop Quick Tools */}
          <Card className="border bg-card shadow-xs">
            <div className="p-3 border-b">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Study Utilities
              </h3>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y border-b text-xs">
              <Link href="/bookmarks" className="p-3 flex items-center gap-2 hover:bg-muted/40 transition-colors">
                <Bookmark className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Bookmarks</span>
              </Link>
              <Link href="/notes" className="p-3 flex items-center gap-2 hover:bg-muted/40 transition-colors">
                <FileText className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">Notes</span>
              </Link>
              <Link href="/leaderboard" className="p-3 flex items-center gap-2 hover:bg-muted/40 transition-colors">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Leaderboard</span>
              </Link>
              <Link href="/review" className="p-3 flex items-center gap-2 hover:bg-muted/40 transition-colors">
                <BookOpen className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Question Bank</span>
              </Link>
            </div>
          </Card>

          {/* 5. Desktop Keyboard Navigation Hint */}
          <div className="rounded-xl border bg-muted/30 p-3.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-semibold text-foreground mb-1.5">
              <Keyboard className="h-3.5 w-3.5" />
              <span>Exam Keyboard Shortcuts</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Select option</span>
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded border text-[10px]">1-4 / A-D</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Navigate</span>
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded border text-[10px]">← / →</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Flag question</span>
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded border text-[10px]">M</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

    </div>
  );
}
