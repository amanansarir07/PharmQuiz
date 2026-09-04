"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { subjects } from "@/data/subjects";
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
import {
  fetchUpcomingExams,
  formatCountdown,
  formatInKathmandu,
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
} from "lucide-react";

function QuizSetupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("mixed");
  const [numQuestions, setNumQuestions] = useState<number>(20);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [revisionMode, setRevisionMode] = useState(false);
  const unitsRef = useRef<HTMLDivElement>(null);
  const difficultyRef = useRef<HTMLDivElement>(null);
  const questionsRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const [exams, setExams] = useState<MockExam[]>([]);
  const [examsLoaded, setExamsLoaded] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    pruneExpiredScratchKeys();
    const subjectParam = searchParams.get("subject");
    if (subjectParam && subjects.find((s) => s.slug === subjectParam)) {
      setSelectedSubject(subjectParam);
    }
  }, [searchParams]);

  // Scheduled mock announcements — same rule as the Mock Test page: a
  // scheduled exam only starts at its admin-set time, never before.
  useEffect(() => {
    let alive = true;
    const refreshExams = () => {
      fetchUpcomingExams().then((list) => {
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
  }, []);

  const subject = subjects.find((s) => s.slug === selectedSubject);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleSubjectChange = (slug: string) => {
    setSelectedSubject(slug);
    setSelectedUnits([]);
    scrollTo(unitsRef);
  };

  const toggleUnit = (unitId: string) => {
    setSelectedUnits((prev) => {
      const next = prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId];
      // Auto-scroll to difficulty when first unit is selected
      if (next.length === 1 && prev.length === 0) {
        scrollTo(difficultyRef);
      }
      return next;
    });
  };

  const selectAllUnits = () => {
    if (subject) {
      setSelectedUnits(subject.units.map((u) => u.id));
      scrollTo(difficultyRef);
    }
  };

  const startQuiz = () => {
    if (!subject) return;
    const config = {
      subject: subject.slug,
      subjectId: subject.id,
      units: selectedUnits.length > 0 ? selectedUnits : subject.units.map((u) => u.id),
      difficulty,
      numQuestions,
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

  const startScheduledMock = (exam: MockExam) => {
    const sessionId = crypto.randomUUID();
    safeSetItem(
      `quiz-config-${sessionId}`,
      JSON.stringify(scheduledMockConfig(exam))
    );
    router.push(`/quiz/${sessionId}`);
  };

  // A scheduled exam that is live now wins; otherwise the soonest upcoming
  // one drives the banner. When none exist, free mock practice is available.
  const liveExam = exams.find((e) => isExamLive(e, now)) || null;
  const upcomingExam = liveExam ? null : exams[0] || null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          MCQ Setup
        </h1>
        <p className="mt-2 text-muted-foreground">
          Configure your MCQ settings and start practicing
        </p>
      </div>

      <div className="space-y-6">
        {/* Mock Test Banner — schedule-aware */}
        <Card
          className={
            liveExam
              ? "border-green-500/50 bg-green-50 dark:bg-green-950/40"
              : "border-primary/30 bg-primary/5"
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
                    <Badge className="bg-green-600 text-white">● LIVE</Badge>
                  )}
                </p>
                {liveExam ? (
                  <p className="text-xs text-muted-foreground">
                    {liveExam.title} · {liveExam.duration_minutes} minutes • 8
                    subjects × 10 questions
                  </p>
                ) : upcomingExam ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {upcomingExam.title} · starts{" "}
                      {formatInKathmandu(upcomingExam.starts_at, "short")}{" "}
                      (Kathmandu)
                    </p>
                    <p className="mt-0.5 text-xs font-semibold tabular-nums text-primary">
                      Opens in {formatCountdown(upcomingExam.starts_at, now)}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    80 questions • 8 subjects • 80 minutes • no negative marking
                  </p>
                )}
              </div>
            </div>
            {!examsLoaded ? (
              <Button disabled className="shrink-0">
                Checking schedule...
              </Button>
            ) : liveExam ? (
              <Button onClick={() => startScheduledMock(liveExam)} className="shrink-0">
                Start Live Mock
              </Button>
            ) : upcomingExam ? (
              <Button disabled className="shrink-0">
                Starts {formatInKathmandu(upcomingExam.starts_at, "short")}
              </Button>
            ) : (
              <Button onClick={() => router.push("/mock-test")} className="shrink-0">
                Start Mock Test
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Subject Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Select Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSubjectChange(s.slug)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                    selectedSubject === s.slug
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.units.length} units • {s.examMarks} marks
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unit Selection */}
        {subject && (
          <Card ref={unitsRef}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Select Units
                </CardTitle>
                <Button variant="outline" size="sm" onClick={selectAllUnits}>
                  Select All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subject.units.map((unit) => (
                  <label
                    key={unit.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                      selectedUnits.includes(unit.id)
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Checkbox
                      checked={selectedUnits.includes(unit.id)}
                      onCheckedChange={() => toggleUnit(unit.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{unit.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {unit.subtopics.length} subtopics • {unit.examHours}h
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {unit.examMarks}m
                    </Badge>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {selectedUnits.length === 0
                  ? "No units selected — all units will be included"
                  : `${selectedUnits.length} unit(s) selected`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Difficulty */}
        <Card ref={difficultyRef}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDifficulty(opt.value)}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    difficulty === opt.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted"
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
            <div className="flex gap-2">
              {QUIZ_QUESTION_OPTIONS.map((num) => (
                <button
                  key={num}
                  onClick={() => setNumQuestions(num)}
                  className={`flex-1 rounded-lg border p-3 text-center transition-all ${
                    numQuestions === num
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <p className="text-lg font-bold">{num}</p>
                </button>
              ))}
            </div>
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
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUIZ_TIME_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setTimeLimit(opt.value)}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    timeLimit === opt.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted"
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
            <label className="flex items-center gap-3 cursor-pointer">
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
            <label className="flex items-center gap-3 cursor-pointer">
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

        {/* Start Quiz Button */}
        <div ref={startRef} />
        <Button
          size="lg"
          className="w-full"
          onClick={startQuiz}
          disabled={!selectedSubject}
        >
          <Play className="mr-2 h-5 w-5" />
          Start MCQs
        </Button>
      </div>
    </div>
  );
}

export default function QuizSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <QuizSetupInner />
    </Suspense>
  );
}
