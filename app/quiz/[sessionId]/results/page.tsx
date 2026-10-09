"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShareResultDialog } from "@/components/share-result-dialog";
import { useAuth } from "@/lib/auth";
import { getProgramCardLabel, getSubjectBySlug, getUnitById, DEFAULT_PROGRAM_SLUG } from "@/data/registry";
import { resolveResultProgram } from "@/lib/result-program";
import { getMockSubjectCount, getMockQuestionCount, getMockDurationMinutes } from "@/lib/mock-exams";
import { safeSetItem } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { AppEmpty } from "@/components/app-state";
import {
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Share2,
  Sparkles,
  ArrowRight,
  Target,
  Timer,
  UserPlus,
} from "lucide-react";

type ResultQuestion = {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  unitId?: string;
  subjectSlug?: string;
  subjectName?: string;
  subjectIcon?: string;
};

type ResultAnswer = {
  selected: number | null;
  correct: number;
  isCorrect: boolean;
};

type QuizResult = {
  answers: ResultAnswer[];
  questions: ResultQuestion[];
  score?: number;
  timeTaken?: number | null;
  config?: {
    mode?: string;
    title?: string;
    subject?: string;
    program?: string;
    difficulty?: string;
    timeLimit?: number;
    [key: string]: unknown;
  };
};

export default function QuizResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [results, setResults] = useState<QuizResult | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`quiz-results-${sessionId}`);
    if (stored) {
      const frame = requestAnimationFrame(() => {
        setResults(JSON.parse(stored) as QuizResult);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [sessionId]);

  // All derivations stay above the early return so hook order never changes.
  const correct = results
    ? results.answers.filter((a) => a.isCorrect).length
    : 0;
  const incorrect = results
    ? results.answers.filter((a) => !a.isCorrect && a.selected !== null)
        .length
    : 0;
  const unattempted = results
    ? results.answers.filter((a) => a.selected === null).length
    : 0;
  const total = results ? results.questions.length : 0;
  // Use score from saved results if available (accounts for negative marking)
  const displayScore = results ? (results.score ?? correct) : 0;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const isMock = results?.config?.mode === "mock";
  const resultMessage =
    percentage >= 80
      ? "You are building strong exam readiness. Keep your momentum with a tougher challenge."
      : percentage >= 60
        ? "Good progress. Review the questions you missed, then practise your weakest area."
        : "This is a useful revision signal. Focus on the missed questions before starting a longer test.";

  // Contiguous subject blocks (mock papers are built subject-by-subject).
  const subjectGroups =
    results && isMock
      ? (() => {
          const groups: { slug: string; name: string; icon: string; start: number; count: number; correct: number }[] = [];
          results.questions.forEach((q, i) => {
            const slug = q.subjectSlug || "other";
            const last = groups[groups.length - 1];
            if (!last || last.slug !== slug) {
              groups.push({ slug, name: q.subjectName || slug, icon: q.subjectIcon || "📘", start: i, count: 1, correct: results.answers[i]?.isCorrect ? 1 : 0 });
            } else {
              last.count += 1;
              if (results.answers[i]?.isCorrect) last.correct += 1;
            }
          });
          return groups;
        })()
      : [];

  // A mock paper covers every subject in the programme; prefer the subjects
  // actually present in this attempt, falling back to the programme total.
  const mockSubjectCount = subjectGroups.length || getMockSubjectCount(resolveResultProgram(results?.config?.program, results?.config?.subject || ""));

  const shareData = results
    ? (() => {
        const cfgMock = results.config?.mode === "mock";
        const slug = results.config?.subject;
        const subjectName = cfgMock
          ? results.config?.title || "Full Mock Test"
          : slug
          ? getSubjectBySlug(slug)?.name ?? slug
          : "MCQ Practice";
        // Context line under the ring: questions • difficulty • timing
        const cfg = results.config || {};
        const difficultyLabel =
          cfg.difficulty && cfg.difficulty !== "mixed"
            ? cfg.difficulty.charAt(0).toUpperCase() + cfg.difficulty.slice(1)
            : "Mixed";
        const timing =
          cfg.timeLimit != null ? `${cfg.timeLimit} min limit` : "No time limit";
        const metaLine = cfgMock
          ? `${total} questions • ${mockSubjectCount} subjects • ${cfg.timeLimit ?? getMockDurationMinutes(resolveResultProgram(cfg.program, cfg.subject || ""))} min`
          : `${total} questions • ${difficultyLabel} • ${timing}`;
        // The result's own programme, not whatever is active now — a student
        // who switched programmes still shares the card for the paper they sat.
        const programLabel = getProgramCardLabel(
          resolveResultProgram(cfg.program, cfg.subject || "")
        );
        return {
          userName: user?.name,
          subjectName,
          programLabel,
          correct,
          incorrect,
          unattempted,
          total,
          percentage,
          scoreNote:
            !cfgMock && results.score !== undefined && results.score !== correct
              ? `Final score ${displayScore}/${total} • negative marking`
              : null,
          metaLine,
        };
      })()
    : null;

  // Extract questions where user made mistakes in this session
  const sessionMistakes = results
    ? results.questions.filter((_, idx) => {
        const a = results.answers[idx];
        return a && !a.isCorrect && a.selected !== null;
      })
    : [];
  const nextStepLabel =
    sessionMistakes.length > 0
      ? `Retry ${sessionMistakes.length} missed question${sessionMistakes.length === 1 ? "" : "s"}`
      : percentage >= 70
        ? user ? "Try a full mock exam" : "Create an account for full mock exams"
        : "Start another practice";

  // Identify the weakest unit in this session
  const weakestUnit = results
    ? (() => {
        const map = new Map<string, { total: number; correct: number; subjectSlug: string }>();
        results.questions.forEach((q, idx) => {
          if (!q.unitId) return;
          const current = map.get(q.unitId) || {
            total: 0,
            correct: 0,
            subjectSlug: q.subjectSlug || results.config?.subject || "",
          };
          current.total += 1;
          if (results.answers[idx]?.isCorrect) current.correct += 1;
          map.set(q.unitId, current);
        });
        const list = Array.from(map.entries()).map(([unitId, data]) => ({
          unitId,
          ...data,
          accuracy: Math.round((data.correct / data.total) * 100),
          unitData: getUnitById(unitId),
        }));
        list.sort((a, b) => a.accuracy - b.accuracy);
        return list.find((u) => u.accuracy < 70 && u.unitData);
      })()
    : null;

  const handlePracticeSessionMistakes = () => {
    if (sessionMistakes.length === 0) return;
    const newSessionId = crypto.randomUUID();
    const config = {
      mode: "mistakes",
      title: "Retry Session Mistakes",
      subject: results?.config?.subject || "all",
      program: results?.config?.program || DEFAULT_PROGRAM_SLUG,
      numQuestions: sessionMistakes.length,
      timeLimit: Math.ceil(sessionMistakes.length * 1.5),
      negativeMarking: false,
      createdAt: new Date().toISOString(),
    };
    safeSetItem(`quiz-questions-${newSessionId}`, JSON.stringify(sessionMistakes));
    safeSetItem(`quiz-config-${newSessionId}`, JSON.stringify(config));
    router.push(`/quiz/${newSessionId}`);
  };

  const handlePracticeWeakUnit = (subjectSlug: string, unitId: string) => {
    const newSessionId = crypto.randomUUID();
    const config = {
      subject: subjectSlug,
      units: [unitId],
      difficulty: "mixed",
      numQuestions: 10,
      timeLimit: 15,
      negativeMarking: false,
      program: results?.config?.program || DEFAULT_PROGRAM_SLUG,
      createdAt: new Date().toISOString(),
    };
    safeSetItem(`quiz-config-${newSessionId}`, JSON.stringify(config));
    router.push(`/quiz/${newSessionId}`);
  };

  if (!results) {
    return <AppEmpty title="No quiz results found" description="This result may have expired or been cleared from this device." action="Start practice" onAction={() => router.push("/quiz")} />;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-6 sm:px-6 sm:pt-9">
      {/* Score Card */}
      <Card className="mb-6 overflow-hidden border-primary/20">
        <CardContent className="p-5 sm:p-8">
          <div className="mb-5 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex size-28 shrink-0 items-center justify-center rounded-full p-2 sm:size-32" style={{ background: `conic-gradient(var(--primary) ${percentage}%, var(--muted) ${percentage}%)` }} role="img" aria-label={`${percentage}% accuracy`}>
              <div className="flex size-full flex-col items-center justify-center rounded-full bg-card"><span className="text-2xl font-bold tabular-nums">{displayScore}/{total}</span><span className="text-xs font-semibold text-primary">{percentage}%</span></div>
            </div>
            <div><p className="text-xs font-bold uppercase tracking-wider text-primary">{isMock ? "Mock result" : "Practice result"}</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{percentage >= 80 ? "Great work!" : percentage >= 60 ? "Well done" : "Keep practising"}</h1><p className="mt-1 text-sm text-muted-foreground">You completed {total} questions. Review what you missed and choose your next step.</p></div>
          </div>
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.04] p-3.5">
            <p className="text-sm font-semibold text-foreground">Your next best step</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {resultMessage}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-primary">
              <span>{nextStepLabel}</span>
              {unattempted > 0 && (
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {unattempted} unanswered
                </span>
              )}
            </div>
          </div>
          {isMock && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <Target className="h-3 w-3 text-primary" />
                <span>{results.config?.title ?? "Full Mock Test"}</span>
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <BookOpen className="h-3 w-3 text-muted-foreground" />
                <span>{mockSubjectCount} subjects &middot; {total} questions</span>
              </Badge>
              {results.timeTaken != null && (
                <Badge variant="outline" className="gap-1.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{formatTime(results.timeTaken)}</span>
                </Badge>
              )}
            </div>
          )}

          <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="rounded-xl bg-green-50 dark:bg-green-950 p-3 sm:p-4 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{correct}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="rounded-xl bg-red-50 dark:bg-red-950 p-3 sm:p-4 text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{incorrect}</p>
              <p className="text-xs text-muted-foreground">Incorrect</p>
            </div>
            <div className="rounded-xl bg-muted p-3 sm:p-4 text-center">
              <p className="text-2xl font-bold">{unattempted}</p>
              <p className="text-xs text-muted-foreground">Skipped</p>
            </div>
          </div>

          <div className="mt-2">
            <Progress value={percentage} className="h-2" />
            <p className="mt-2 text-sm text-muted-foreground">
              {correct} of {total} correct
            </p>
          </div>

          {results.timeTaken !== null && results.timeTaken !== undefined && (
            <div className="mt-2 flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Time taken: {formatTime(results.timeTaken)}
            </div>
          )}

          {!user && (
            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/[0.04] p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Want to keep this progress?</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Create a free account to sync results, streaks, and mistakes across devices.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/auth/register?program=${encodeURIComponent(resolveResultProgram(results.config?.program, results.config?.subject || ""))}`}
                  className={cn(buttonVariants({ size: "sm" }), "shrink-0 gap-1.5")}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Create free account
                </Link>
                <Link href="/dashboard" className="text-center text-xs font-medium text-muted-foreground hover:text-primary">Continue as guest</Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mock per-subject breakdown */}
      {isMock && subjectGroups.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Subject-wise Result</h2>
              <Link href="/mock-test" className="text-xs text-primary hover:underline">
                Take another
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {subjectGroups.map((g) => (
                <div key={g.slug} className="rounded-xl border p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="flex min-w-0 items-center gap-2 text-sm font-medium">
                      <span className="text-base">{g.icon}</span>
                      <span className="truncate">{g.name}</span>
                    </p>
                    <span
                      className={`shrink-0 text-sm font-bold ${
                        g.correct / g.count >= 0.7
                          ? "text-green-600 dark:text-green-400"
                          : g.correct / g.count >= 0.5
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {g.correct}/{g.count}
                    </span>
                  </div>
                  <Progress value={(g.correct / g.count) * 100} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Next Practice Card (Feedback Loop) */}
      <Card className="mb-6 border-2 border-primary/40 bg-primary/[0.03] shadow-md">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary font-bold text-base sm:text-lg">
              <Sparkles className="h-5 w-5" />
              <span>Keep the momentum</span>
            </div>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              <RotateCcw className="h-3 w-3 mr-1" /> Recommended
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Recommendation 1: If user made mistakes */}
            {sessionMistakes.length > 0 && (
              <div className="rounded-xl border bg-card p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500 text-white text-[11px]">
                      {sessionMistakes.length} Mistakes
                    </Badge>
                    <span className="font-semibold text-sm">Retry Missed Questions</span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Drill only the questions you got wrong to turn weaknesses into strengths before your board exams.
                  </p>
                </div>
                <Button
                  onClick={handlePracticeSessionMistakes}
                  size="sm"
                  className="mt-4 gap-1.5 w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Practice {sessionMistakes.length} Missed Questions
                </Button>
              </div>
            )}

            {/* Recommendation 2: If a weak unit is detected */}
            {weakestUnit && (
              <div className="rounded-xl border bg-card p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500 text-white text-[11px]">
                      {weakestUnit.accuracy}% Accuracy
                    </Badge>
                    <span className="font-semibold text-sm truncate">
                      Weak Area: {weakestUnit.unitData?.name}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    This unit had the lowest score in your test. Practice 10 targeted MCQs to reinforce core concepts.
                  </p>
                </div>
                <Button
                  onClick={() => handlePracticeWeakUnit(weakestUnit.subjectSlug, weakestUnit.unitId)}
                  size="sm"
                  variant="outline"
                  className="mt-4 gap-1.5 w-full font-semibold border-primary/40 hover:bg-primary/5"
                >
                  <Target className="h-3.5 w-3.5 text-primary" />
                  Practice Unit ({weakestUnit.unitData?.name})
                </Button>
              </div>
            )}

            {/* Recommendation 3: If high score or mock test suggestion */}
            {percentage >= 70 && (
              <div className="rounded-xl border bg-card p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500 text-white text-[11px]">
                      Exam Ready
                    </Badge>
                    <span className="font-semibold text-sm">Full Board Mock Exam</span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Great performance! {user ? "Challenge yourself" : "Create an account to challenge yourself"} with the full {getMockQuestionCount(resolveResultProgram(results.config?.program, results.config?.subject || ""))}-question board paper.
                  </p>
                </div>
                <Link
                  href={user ? "/mock-test" : `/auth/register?program=${encodeURIComponent(resolveResultProgram(results.config?.program, results.config?.subject || ""))}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 gap-1.5 w-full font-semibold")}
                >
                  <Timer className="h-3.5 w-3.5 text-emerald-500" />
                  {user ? "Enter Full Mock Exam" : "Create account for mock exams"}
                </Link>
              </div>
            )}

            {/* Return to Personal Dashboard */}
            <div className="rounded-xl border bg-card p-4 flex flex-col justify-between">
              <div>
                <span className="font-semibold text-sm">{user ? "Your dashboard" : "Keep practising"}</span>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {user ? "Check your progress and explore other subjects." : "Explore subjects and start another short practice session."}
                </p>
              </div>
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-4 gap-1.5 w-full text-xs font-semibold hover:bg-muted")}
              >
                {user ? "Go to dashboard" : "Back to guest home"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Button
          className="flex-1"
          onClick={() => setShareOpen(true)}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Result
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            // Retake: create new session with same config
            if (results?.config) {
              const config = { ...results.config };
              delete config.completedAt;
              const newSessionId = crypto.randomUUID();
              localStorage.setItem(`quiz-config-${newSessionId}`, JSON.stringify(config));
              router.push(`/quiz/${newSessionId}`);
            } else {
              router.push("/quiz");
            }
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Retake
        </Button>
        <Link href="/quiz" className="flex-1">
          <Button variant="outline" className="w-full">
            <BookOpen className="mr-2 h-4 w-4" />
            New Quiz
          </Button>
        </Link>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setShowAnswers(!showAnswers)}
        >
          {showAnswers ? "Hide" : "Show"} Review
        </Button>
      </div>

      {shareData && (
        <ShareResultDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          data={shareData}
        />
      )}

      {/* Quick Summary */}
      {!showAnswers && incorrect > 0 && (
        <Card className="mb-6 border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2 text-red-600 dark:text-red-400">
              {incorrect} incorrect - tap Detailed Review for explanations
            </p>
            {results.questions
              .map((q, i) => ({ q, answer: results.answers[i], i }))
              .filter(({ answer }) => !answer.isCorrect && answer.selected !== null)
              .slice(0, 3)
              .map(({ q, i }) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground mb-1">
                  <XCircle className="h-3 w-3 mt-0.5 shrink-0 text-red-500" />
                  <span className="line-clamp-1">{q.question}</span>
                </div>
              ))}
            {incorrect > 3 && <p className="text-xs text-muted-foreground mt-1">+{incorrect - 3} more</p>}
          </CardContent>
        </Card>
      )}

      {/* Detailed Review */}
      {showAnswers && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Detailed Review</h2>
          {results.questions.map((q, i) => {
            const isSectionStart =
              isMock &&
              i > 0 &&
              results.questions[i - 1]?.subjectSlug !== q.subjectSlug;
            const section = isSectionStart
              ? subjectGroups.find((g) => g.start === i)
              : null;
            const answer = results.answers[i];
            const isCorrect = answer.isCorrect;
            const wasSkipped = answer.selected === null;

            return (
              <div key={i}>
              {section && (
                <h3 className="mt-6 mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                  <span>{section.icon}</span>
                  <span className="truncate">{section.name}</span>
                  <Badge variant="outline" className="shrink-0">
                    {section.correct}/{section.count} correct
                  </Badge>
                </h3>
              )}
              <Card
                key={i}
                className={`border-l-4 ${
                  isCorrect
                    ? "border-l-green-500"
                    : wasSkipped
                    ? "border-l-yellow-400"
                    : "border-l-red-500"
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{q.question}</p>
                      <div className="mt-3 space-y-2">
                        {q.options.map((opt: string, j: number) => {
                          const isOptionCorrect = j === q.correctIndex;
                          const isOptionSelected = j === answer.selected;
                          return (
                            <div
                              key={j}
                              className={`flex items-center gap-2 rounded-lg p-2 text-sm ${
                                isOptionCorrect
                                  ? "bg-green-50 dark:bg-green-950 dark:text-green-300 text-green-800"
                                  : isOptionSelected && !isCorrect
                                  ? "bg-red-50 dark:bg-red-950 dark:text-red-300 text-red-800"
                                  : ""
                              }`}
                            >
                              {isOptionCorrect ? (
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : isOptionSelected && !isCorrect ? (
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              ) : (
                                <span className="h-4 w-4" />
                              )}
                              <span className="font-medium">
                                {String.fromCharCode(65 + j)}.
                              </span>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-sm text-blue-800 dark:text-blue-300">
                        💡 <strong>Explanation:</strong> {q.explanation}
                      </div>
                    </div>
                    <Badge
                      variant={isCorrect ? "default" : wasSkipped ? "secondary" : "destructive"}
                      className="shrink-0"
                    >
                      {isCorrect ? "✓" : wasSkipped ? "—" : "✗"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
