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
import { ScoreRing } from "@/components/learning-ui";
import { HomeActionRow, HomeListRow } from "@/components/home/home-components";
import { AppEmpty, AppLoading } from "@/components/app-state";
import {
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Share2,
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
  const [loaded, setLoaded] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`quiz-results-${sessionId}`);
    const frame = requestAnimationFrame(() => {
      if (stored) {
        try { setResults(JSON.parse(stored) as QuizResult); } catch { setResults(null); }
      }
      setLoaded(true);
    });
    return () => cancelAnimationFrame(frame);
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
  const answered = correct + incorrect;
  // Use score from saved results if available (accounts for negative marking)
  const displayScore = results ? (results.score ?? correct) : 0;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const isMock = results?.config?.mode === "mock";
  const resultMessage =
    percentage >= 80
      ? "You are building strong exam readiness. Keep your momentum with a tougher challenge."
      : percentage >= 60
        ? "Good progress. Review the questions you missed, then practise your weakest area."
        : unattempted > 0
          ? "You left some questions unanswered. Review them, then try another short session."
          : "Review the questions you missed before starting a longer test.";

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
  // Identify the weakest unit in this session
  const weakestUnit = results
    ? (() => {
        const map = new Map<string, { total: number; correct: number; subjectSlug: string }>();
        results.questions.forEach((q, idx) => {
          if (!q.unitId || results.answers[idx]?.selected === null) return;
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

  if (!loaded) return <AppLoading label="Loading your result" variant="questions" />;
  if (!results) {
    return <AppEmpty title="No quiz results found" description="This result may have expired or been cleared from this device." action="Start practice" onAction={() => router.push("/quiz")} />;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-7 sm:pt-9">
      {/* Score Card */}
      <Card className="mb-6 overflow-hidden border-0 bg-card shadow-[var(--shadow-card)]">
        <CardContent className="p-5 sm:p-8">
          <div className="mb-5 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <ScoreRing value={percentage} label="Accuracy" />
            <div><p className="text-xs font-semibold text-primary">{isMock ? "Mock result" : "Practice result"}</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{percentage >= 80 ? "Great work!" : percentage >= 60 ? "Well done" : "Keep practising"}</h1><p className="mt-1 text-sm text-muted-foreground">Score: {displayScore}/{total}. You answered {answered} of {total} questions.</p></div>
          </div>
          <p className="border-t pt-4 text-sm leading-6 text-muted-foreground">{resultMessage}</p>
          {unattempted > 0 && <p className="mt-1 text-xs font-medium text-muted-foreground">{unattempted} unanswered</p>}
          {isMock && <p className="mt-3 text-xs text-muted-foreground">{results.config?.title ?? "Full mock test"} · {mockSubjectCount} subjects · {results.timeTaken != null ? formatTime(results.timeTaken) : `${total} questions`}</p>}

          <div className="mb-4 mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-[var(--subject-green-bg)] py-3 text-center">
              <p className="text-xl font-extrabold text-[var(--subject-green-fg)]">{correct}</p>
              <p className="text-xs font-semibold text-muted-foreground">Correct</p>
            </div>
            <div className="rounded-2xl bg-destructive/10 py-3 text-center">
              <p className="text-xl font-extrabold text-destructive">{incorrect}</p>
              <p className="text-xs font-semibold text-muted-foreground">Incorrect</p>
            </div>
            <div className="rounded-2xl bg-[var(--subject-amber-bg)] py-3 text-center">
              <p className="text-xl font-extrabold text-[var(--subject-amber-fg)]">{unattempted}</p>
              <p className="text-xs font-semibold text-muted-foreground">Skipped</p>
            </div>
          </div>

          {!isMock && <div className="mt-2">
            <Progress value={percentage} className="h-2" />
            <p className="mt-2 text-sm text-muted-foreground">
              {correct} of {total} correct
            </p>
          </div>}

          {!isMock && results.timeTaken !== null && results.timeTaken !== undefined && (
            <div className="mt-2 flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Time taken: {formatTime(results.timeTaken)}
            </div>
          )}

          {!user && (
            <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
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
        <section className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Results by subject</h2>
            </div>
            <div className="divide-y border-y sm:grid sm:grid-cols-2 sm:divide-y-0">
              {subjectGroups.map((g) => (
                <div key={g.slug} className="py-3 sm:border-b sm:px-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="min-w-0 text-sm font-medium leading-5">{g.name}</p>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">{g.correct}/{g.count}</span>
                  </div>
                  <Progress value={(g.correct / g.count) * 100} className="h-1.5" />
                </div>
              ))}
            </div>
        </section>
      )}

      {/* Personalized Next Practice Card (Feedback Loop) */}
      {(!isMock || sessionMistakes.length > 0 || weakestUnit) && <section className="mb-6">
        <h2 className="mb-3 text-base font-extrabold">What to do next</h2>
        <div className="space-y-2">
          {sessionMistakes.length > 0 && <HomeActionRow
            icon={<RotateCcw />}
            title={`Retry ${sessionMistakes.length} missed ${sessionMistakes.length === 1 ? "question" : "questions"}`}
            detail="Practise only the answers you got wrong"
            onClick={handlePracticeSessionMistakes}
            tone="danger"
          />}
          {weakestUnit && <HomeActionRow
            icon={<Target />}
            title={weakestUnit.unitData?.name || "Practice your weakest unit"}
            detail={`${weakestUnit.accuracy}% accuracy · 10 focused questions`}
            onClick={() => handlePracticeWeakUnit(weakestUnit.subjectSlug, weakestUnit.unitId)}
            tone="warning"
          />}
          {!isMock && percentage >= 70 && <HomeListRow
            href={user ? "/mock-test" : `/auth/register?program=${encodeURIComponent(resolveResultProgram(results.config?.program, results.config?.subject || ""))}`}
            icon={<Timer />}
            title="Try a full board mock"
            detail={user ? `${getMockQuestionCount(resolveResultProgram(results.config?.program, results.config?.subject || ""))} questions · timed exam practice` : "Create an account to try a full board paper"}
            colorIndex={0}
          />}
          {!isMock && <HomeListRow
            href="/dashboard"
            icon={<BookOpen />}
            title={user ? "Your dashboard" : "Keep practising"}
            detail={user ? "Check progress and explore other subjects" : "Explore subjects and start another short session"}
            colorIndex={5}
          />}
        </div>
      </section>}

      {/* Action Buttons */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setShareOpen(true)}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Result
        </Button>
        <Button
          variant={isMock ? "default" : "outline"}
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
        <Link href="/quiz" className={cn(buttonVariants({ variant: "outline" }), "flex-1")}><BookOpen className="mr-2 h-4 w-4" />New Quiz</Link>
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
                      <div className="mt-3 rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
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
