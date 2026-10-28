"use client";

import { useState, useEffect, useMemo, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSubjectsForProgram } from "@/data/registry";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  QUIZ_QUESTION_OPTIONS,
  QUIZ_TIME_OPTIONS,
  DIFFICULTY_OPTIONS,
} from "@/lib/constants";
import { safeSetItem, pruneExpiredScratchKeys } from "@/lib/storage";
import { useActiveProgram } from "@/lib/program";
import { useAuth } from "@/lib/auth";
import { AppError, AppLoading } from "@/components/app-state";
import {
  fetchUpcomingExams,
  formatCountdown,
  formatInKathmandu,
  getMockDurationMinutes,
  getMockQuestionCount,
  getMockSubjectCount,
  isExamLive,
  scheduledMockConfig,
  type MockExam,
} from "@/lib/mock-exams";
import {
  Settings,
  Play,
  Clock,
  Hash,
  Gauge,
  CheckSquare,
  BookOpen,
  Timer,
  Zap,
  Layers3,
  ClipboardCheck,
  Sparkles,
  Check,
} from "lucide-react";

type QuizPreset = "quick" | "chapter" | "subject" | "revision";

function QuizSetupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("mixed");
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [revisionMode, setRevisionMode] = useState(false);
  const [preset, setPreset] = useState<QuizPreset>("quick");
  const [mobileStep, setMobileStep] = useState<1 | 2 | 3>(1);
  const [starting, setStarting] = useState(false);
  const unitsRef = useRef<HTMLDivElement>(null);
  const difficultyRef = useRef<HTMLDivElement>(null);
  const questionsRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const [exams, setExams] = useState<MockExam[]>([]);
  const [examsLoaded, setExamsLoaded] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const { programSlug, program } = useActiveProgram();
  const { user, isLoading: authLoading, authRestorationTimedOut } = useAuth();
  const subjects = useMemo(
    () => getSubjectsForProgram(programSlug),
    [programSlug]
  );

  useEffect(() => {
    pruneExpiredScratchKeys();
    const subjectParam = searchParams.get("subject");
    if (subjectParam && subjects.find((s) => s.slug === subjectParam)) {
      const unitParam = searchParams.get("unit");
      const frame = requestAnimationFrame(() => {
        setSelectedSubject(subjectParam);
        if (unitParam && subjects.find((s) => s.slug === subjectParam)?.units.some((unit) => unit.id === unitParam)) setSelectedUnits([unitParam]);
        setMobileStep(unitParam ? 3 : 2);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [searchParams, subjects]);

  // Scheduled mock announcements use the same rule as the Mock Test page: a
  // scheduled exam only starts at its admin-set time, never before.
  // Programme-scoped: a student only sees their own programme's papers.
  useEffect(() => {
    let alive = true;
    const refreshExams = () => {
      fetchUpcomingExams(programSlug).then((list) => {
        if (alive) {
          setExams(list);
          setExamsLoaded(true);
        }
      });
    };
    refreshExams();
    const refresh = setInterval(refreshExams, 60_000);
    const t = setInterval(() => setNow(new Date()), 1_000);
    return () => {
      alive = false;
      clearInterval(t);
      clearInterval(refresh);
    };
  }, [programSlug]);

  const subject = subjects.find((s) => s.slug === selectedSubject);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleSubjectChange = (slug: string) => {
    setSelectedSubject(slug);
    const nextSubject = subjects.find((item) => item.slug === slug);
    if (preset === "chapter") {
      setSelectedUnits(nextSubject?.units[0]?.id ? [nextSubject.units[0].id] : []);
    } else if (preset === "subject") {
      setSelectedUnits(nextSubject?.units.map((unit) => unit.id) ?? []);
    } else {
      setSelectedUnits([]);
    }
    setMobileStep(2);
    if (window.innerWidth >= 640) scrollTo(unitsRef);
  };

  const applyPreset = (nextPreset: QuizPreset) => {
    setPreset(nextPreset);
    if (nextPreset === "quick") {
      setSelectedUnits([]);
      setDifficulty("mixed");
      setNumQuestions(10);
      setTimeLimit(10);
      setNegativeMarking(false);
      setRevisionMode(false);
    } else if (nextPreset === "chapter") {
      setSelectedUnits((current) =>
        current.length > 0 ? current : subject ? [subject.units[0]?.id].filter(Boolean) : []
      );
      setDifficulty("mixed");
      setNumQuestions(10);
      setTimeLimit(15);
      setNegativeMarking(false);
      setRevisionMode(false);
    } else if (nextPreset === "subject") {
      setSelectedUnits(subject?.units.map((unit) => unit.id) ?? []);
      setDifficulty("mixed");
      setNumQuestions(user ? 20 : 10);
      setTimeLimit(null);
      setNegativeMarking(false);
      setRevisionMode(false);
    } else {
      setDifficulty("mixed");
      setNumQuestions(user ? 20 : 10);
      setTimeLimit(null);
      setNegativeMarking(false);
      setRevisionMode(true);
    }
  };

  const toggleUnit = (unitId: string) => {
    setSelectedUnits((prev) => {
      const next = prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId];
      // Auto-scroll to difficulty when first unit is selected
      if (window.innerWidth >= 640 && next.length === 1 && prev.length === 0) {
        scrollTo(difficultyRef);
      }
      return next;
    });
  };

  const selectAllUnits = () => {
    if (subject) {
      setSelectedUnits(subject.units.map((u) => u.id));
      if (window.innerWidth >= 640) scrollTo(difficultyRef);
    }
  };

  const startQuiz = () => {
    if (!subject || starting) return;
    setStarting(true);
    const config = {
      subject: subject.slug,
      subjectId: subject.id,
      program: programSlug,
      units: selectedUnits.length > 0 ? selectedUnits : subject.units.map((u) => u.id),
      difficulty,
      numQuestions: user ? numQuestions : Math.min(numQuestions, 10),
      timeLimit,
      negativeMarking,
      revisionMode,
    };

    const sessionId = crypto.randomUUID();
    safeSetItem(
      `quiz-config-${sessionId}`,
      JSON.stringify(config)
    );
    router.push(`/quiz/${sessionId}`);
  };

  const startQuickPractice = () => {
    const firstSubject = subjects[0];
    if (!firstSubject || starting) return;
    setStarting(true);
    const sessionId = crypto.randomUUID();
    safeSetItem(
      `quiz-config-${sessionId}`,
      JSON.stringify({
        subject: firstSubject.slug,
        subjectId: firstSubject.id,
        program: programSlug,
        units: firstSubject.units.map((unit) => unit.id),
        difficulty: "mixed",
        numQuestions: 5,
        timeLimit: 5,
        negativeMarking: false,
        revisionMode: false,
      })
    );
    router.push(`/quiz/${sessionId}`);
  };

  const startScheduledMock = (exam: MockExam) => {
    if (!user || starting) return;
    setStarting(true);
    const sessionId = crypto.randomUUID();
    safeSetItem(
      `quiz-config-${sessionId}`,
      JSON.stringify(scheduledMockConfig(exam, programSlug))
    );
    router.push(`/quiz/${sessionId}`);
  };

  // A scheduled exam that is live now wins; otherwise the soonest upcoming
  // one drives the banner. When none exist, free mock practice is available.
  const liveExam = exams.find((e) => isExamLive(e, now)) || null;
  const upcomingExam = liveExam ? null : exams[0] || null;

  if (authLoading) return <AppLoading label="Preparing your practice" />;
  if (authRestorationTimedOut) return <AppError title="Could not check your session" description="We could not confirm your account right now. Please try again." onRetry={() => window.location.reload()} />;

  return (
    <div className={`mx-auto max-w-5xl px-4 pt-6 sm:px-6 sm:pb-10 sm:pt-9 ${mobileStep === 2 ? "pb-32" : "pb-10"}`}>
      <div className="mb-6">
        <p className="text-xs font-medium text-muted-foreground">{program.shortLabel} · Practice</p>
        <h1 className="mt-1 text-[1.65rem] font-bold tracking-tight sm:text-[1.9rem]">{mobileStep === 1 ? "Choose a subject" : mobileStep === 2 ? "Choose units" : "Session settings"}</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:hidden">{mobileStep === 1 ? `${subjects.length} subjects · ${subjects.reduce((total, item) => total + item.units.length, 0)} units` : `Step ${mobileStep} of 3`}</p>
        <p className="mt-2 hidden text-sm text-muted-foreground sm:block">Choose a subject, units, and your practice settings.</p>
        <ol className="mt-4 grid grid-cols-3 gap-2 sm:hidden" aria-label="Practice setup progress">
          {[
            ["Subject", 1],
            ["Units", 2],
            ["Settings", 3],
          ].map(([label, step]) => (
            <li key={label as string} className="min-w-0">
              <div className={`h-1 rounded-full ${mobileStep >= (step as number) ? "bg-primary" : "bg-muted"}`} />
              <span className={`mt-1.5 block truncate text-[11px] font-semibold ${mobileStep === step ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
            </li>
          ))}
        </ol>
      </div>

      {mobileStep === 1 && <section className="mb-5 rounded-2xl bg-secondary/70 p-4 shadow-[var(--shadow-card)] sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Short on time?</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Try 5 mixed questions from {subjects[0]?.name || "your first subject"}.</p>
          </div>
          <Button type="button" variant="outline" className="min-h-11 shrink-0 px-3" disabled={starting || subjects.length === 0} onClick={startQuickPractice}>
            {starting ? "Preparing…" : "Quick start"}
          </Button>
        </div>
      </section>}

      {mobileStep === 2 && subject && <section className="mb-4 flex items-center gap-3 rounded-2xl bg-card p-3 shadow-[var(--shadow-card)] sm:hidden">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-bold text-primary" aria-hidden="true">{subject.name.slice(0, 1)}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{subject.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{subject.units.length} units · {subject.examMarks} marks</p>
        </div>
        <button type="button" onClick={() => setMobileStep(1)} className="min-h-10 shrink-0 rounded-lg px-2 text-xs font-semibold text-primary hover:bg-primary/5">Change</button>
      </section>}
      {mobileStep === 3 && subject && <section className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-secondary/60 px-3 py-2.5 text-xs sm:hidden">
        <span className="font-semibold">{subject.name}</span>
        <span className="text-muted-foreground">{selectedUnits.length === 0 ? `All ${subject.units.length} units` : `${selectedUnits.length} of ${subject.units.length} units`}</span>
        <button type="button" onClick={() => setMobileStep(2)} className="ml-auto min-h-8 font-semibold text-primary">Edit</button>
      </section>}
      <div className="space-y-4">
        <div className="hidden items-center justify-between gap-3 border-b pb-4 sm:flex"><p className="text-sm text-muted-foreground">Short on time? Start with five mixed questions.</p><Button variant="outline" disabled={starting} onClick={startQuickPractice}>{starting ? "Preparing practice…" : "Start 5-question practice"}</Button></div>

        <Card className={`border-0 bg-card shadow-[var(--shadow-card)] ${mobileStep === 3 ? "" : "hidden sm:block"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Choose how you want to practise</CardTitle>
            <p className="text-sm text-muted-foreground">
              Pick a mode and only change the details when you need to.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { value: "quick" as const, label: "Quick practice", detail: "10 mixed MCQs", icon: Zap },
              { value: "chapter" as const, label: "Chapter practice", detail: "Focus on one unit", icon: Layers3 },
              { value: "subject" as const, label: "Full subject", detail: "Cover every unit", icon: ClipboardCheck },
              { value: "revision" as const, label: "Revision mode", detail: "See explanations", icon: Sparkles },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => applyPreset(option.value)}
                  aria-pressed={preset === option.value}
                  className={`min-h-24 rounded-2xl p-3 text-left transition-all ${
                    preset === option.value
                      ? "bg-secondary ring-2 ring-primary/40"
                      : "bg-muted/60 hover:bg-muted"
                  }`}
                >
                  <span className="mb-2 flex size-8 items-center justify-center rounded-xl bg-secondary text-primary"><Icon className="h-4 w-4" /></span>
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{option.detail}</p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Mock Test Banner: schedule-aware */}
        {(liveExam || upcomingExam) && <Card
          className={
            `hidden sm:block ${liveExam
              ? "border-green-500/50 bg-green-50 dark:bg-green-950/40"
              : "border-primary/30 bg-primary/5"}`
          }
        >
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Timer className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  Full Mock Test
                  {liveExam && (
                    <Badge className="bg-green-600 text-white">LIVE</Badge>
                  )}
                </p>
                {liveExam ? (
                  <p className="text-xs text-muted-foreground">
                    {liveExam.title} / {liveExam.duration_minutes} minutes /{' '}
                    {getMockSubjectCount(programSlug)} subjects x 10 questions
                  </p>
                ) : upcomingExam ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {upcomingExam.title} · starts{" "}
                      {formatInKathmandu(upcomingExam.starts_at, "short")}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold tabular-nums text-primary">
                      Opens in {formatCountdown(upcomingExam.starts_at, now)}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {getMockQuestionCount(programSlug)} questions / {getMockSubjectCount(programSlug)}{' '}
                    subjects / {getMockDurationMinutes(programSlug)} minutes / no negative marking
                  </p>
                )}
              </div>
            </div>
            {!examsLoaded ? (
              <Button disabled className="shrink-0">
                Checking schedule...
              </Button>
            ) : liveExam && user ? (
              <Button onClick={() => startScheduledMock(liveExam)} disabled={starting} className="shrink-0">
                {starting ? "Preparing test…" : "Start Live Mock"}
              </Button>
            ) : liveExam || upcomingExam ? (
              <Button disabled className="shrink-0">
                {upcomingExam ? `Starts ${formatInKathmandu(upcomingExam.starts_at, "short")}` : "Sign in for scheduled mocks"}
              </Button>
            ) : (
              <Button onClick={() => router.push("/mock-test")} className="shrink-0">
                Start Mock Test
              </Button>
            )}
          </CardContent>
        </Card>}

        {/* Subject Selection */}
        <Card className={`border-0 bg-transparent shadow-none sm:bg-card sm:shadow-[var(--shadow-card)] ${mobileStep === 1 ? "" : "hidden sm:block"}`}>
          <CardHeader className="hidden sm:block">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Select Subject
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  aria-pressed={selectedSubject === s.slug}
                  onClick={() => handleSubjectChange(s.slug)}
                  className={`relative flex min-h-28 flex-col items-start justify-between rounded-2xl p-3 text-left transition-all ${
                    selectedSubject === s.slug
                      ? "bg-secondary ring-2 ring-primary/40"
                      : "bg-card shadow-[var(--shadow-card)] hover:bg-muted/60"
                  }`}
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary" aria-hidden="true"><BookOpen className="size-[18px]" /></span>
                  <span className="mt-3 min-w-0">
                    <span className="block line-clamp-2 text-sm font-bold leading-5">{s.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {s.units.length} units · {s.examMarks} marks
                    </span>
                  </span>
                  {selectedSubject === s.slug && <Check className="absolute right-3 top-3 size-4 text-primary" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unit Selection */}
        {subject && (
          <Card ref={unitsRef} className={`${mobileStep === 2 ? "" : "hidden sm:block"} border-0 bg-transparent py-0 shadow-none sm:bg-card sm:py-4 sm:shadow-[var(--shadow-card)]`}>
            <CardHeader className="px-0 sm:px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="hidden items-center gap-2 text-lg sm:flex">
                  <CheckSquare className="h-5 w-5" />
                  Select Units
                </CardTitle>
                <Button variant="outline" size="sm" onClick={selectAllUnits}>
                  Select All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-0 sm:px-4">
              <div className="space-y-2">
                {subject.units.map((unit) => (
                  <label
                    key={unit.id}
                    className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 transition-colors ${
                      selectedUnits.includes(unit.id)
                        ? "bg-secondary/70 ring-1 ring-primary/30"
                        : "bg-card shadow-[var(--shadow-card)] hover:bg-muted/60"
                    }`}
                  >
                    <Checkbox
                      checked={selectedUnits.includes(unit.id)}
                      onCheckedChange={() => toggleUnit(unit.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{unit.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {unit.subtopics.length} subtopics · {unit.examHours} hours
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground sm:rounded-full sm:border sm:px-2 sm:py-0.5">{unit.examMarks} marks</span>
                  </label>
                ))}
              </div>
              <p className="mt-3 hidden text-xs text-muted-foreground sm:block">
                {selectedUnits.length === 0
                  ? "No units selected - all units will be included"
                  : `${selectedUnits.length} unit(s) selected`}
              </p>
            </CardContent>
          </Card>
        )}
        <details className={`group rounded-2xl bg-card shadow-[var(--shadow-card)] ${mobileStep === 3 ? "" : "hidden sm:block"}`}>
          <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-semibold [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Session preferences
            </span>
            <span className="text-xs text-muted-foreground group-open:hidden">Optional</span>
          </summary>
          <div className="grid gap-4 p-4 sm:grid-cols-2 [&>[data-slot=card]]:shadow-none">
        {/* Difficulty */}
        <Card ref={difficultyRef}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  aria-pressed={difficulty === opt.value}
                  onClick={() => setDifficulty(opt.value)}
                  className={`rounded-xl p-3 text-center transition-all ${
                    difficulty === opt.value
                      ? "bg-secondary ring-2 ring-primary/40"
                      : "bg-muted/60 hover:bg-muted"
                  }`}
                >
                  <p className="text-sm font-medium">{opt.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Number of Questions */}
        <Card ref={questionsRef}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Number of Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {QUIZ_QUESTION_OPTIONS.map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={!user && num > 10}
                  title={!user && num > 10 ? "Create a free account for longer sessions" : undefined}
                  aria-pressed={numQuestions === num}
                  onClick={() => setNumQuestions(num)}
                  className={`flex-1 rounded-xl p-3 text-center transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                    numQuestions === num
                      ? "bg-secondary ring-2 ring-primary/40"
                      : "bg-muted/60 hover:bg-muted"
                  }`}
                >
                  <p className="text-lg font-bold">{num}</p>
                </button>
              ))}
            </div>
            {!user && <p className="mt-3 text-xs text-muted-foreground">Guest sessions include up to 10 questions. <a href="/auth/register" className="font-semibold text-primary underline underline-offset-2">Create a free account</a> for longer practice.</p>}
          </CardContent>
        </Card>

        {/* Time Limit */}
        <Card ref={timeRef}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {QUIZ_TIME_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  aria-pressed={timeLimit === opt.value}
                  onClick={() => setTimeLimit(opt.value)}
                  className={`rounded-xl p-3 text-center transition-all ${
                    timeLimit === opt.value
                      ? "bg-secondary ring-2 ring-primary/40"
                      : "bg-muted/60 hover:bg-muted"
                  }`}
                >
                  <p className="text-sm font-medium">{opt.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Negative Marking */}
        <Card ref={optionsRef}>
          <CardContent className="pt-6">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-muted/60 p-4">
              <Checkbox
                checked={negativeMarking}
                onCheckedChange={(v) => setNegativeMarking(v === true)}
              />
              <div>
                <p className="text-sm font-medium">Negative Marking</p>
                <p className="text-xs text-muted-foreground">
                  Deduct 1 mark for each wrong answer
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Revision Mode */}
        <Card>
          <CardContent className="pt-6">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-muted/60 p-4">
              <Checkbox
                checked={revisionMode}
                onCheckedChange={(v) => setRevisionMode(v === true)}
              />
              <div>
                <p className="text-sm font-medium">Revision Mode</p>
                <p className="text-xs text-muted-foreground">
                  See the correct answer and explanation after each question
                </p>
              </div>
            </label>
          </CardContent>
        </Card>
          </div>
        </details>

        {/* Start Quiz Button */}
        <div ref={startRef} />
        {subject ? <div className={`sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 rounded-2xl bg-card/95 p-3 shadow-[var(--shadow-floating)] backdrop-blur-lg ring-1 ring-border/50 lg:bottom-4 ${mobileStep === 3 ? "" : "hidden sm:block"}`}><div className="mb-2 flex items-center justify-between gap-3 px-1 text-xs"><span className="min-w-0 truncate font-semibold">{subject.name}</span><span className="shrink-0 text-muted-foreground">{numQuestions} questions · {timeLimit ? `${timeLimit} min` : "Untimed"}</span></div>
        <Button
          size="lg"
          className="min-h-12 w-full font-semibold"
          disabled={starting}
          onClick={startQuiz}
        >
          {starting ? <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Play className="mr-2 h-5 w-5" />}
          {starting ? "Preparing practice…" : "Start practice"}
        </Button>
        </div> : <div className="hidden min-h-14 items-center gap-3 border-t pt-5 text-sm text-muted-foreground sm:flex"><span>Select a subject to unlock your practice settings.</span></div>}
      </div>
      {subject && mobileStep === 2 && <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-30 bg-background/95 px-4 py-3 backdrop-blur-lg sm:hidden"><div className="mx-auto max-w-5xl"><p className="mb-2 text-xs text-muted-foreground">{selectedUnits.length === 0 ? `All ${subject.units.length} units included` : `${selectedUnits.length} of ${subject.units.length} units selected`}</p><Button type="button" className="min-h-11 w-full" onClick={() => setMobileStep(3)}>Continue to settings</Button></div></div>}
    </div>
  );
}

export default function QuizSetupPage() {
  return (
    <Suspense
      fallback={
        <AppLoading label="Loading practice options" />
      }
    >
      <QuizSetupInner />
    </Suspense>
  );
}
