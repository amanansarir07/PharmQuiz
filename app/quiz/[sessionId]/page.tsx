"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  getQuestionsForQuiz,
  getMockQuestions,
  type QuizQuestion,
} from "@/lib/quiz-loader";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  DEFAULT_PROGRAM_SLUG,
  getSubjectsForProgram,
} from "@/data/registry";
import { getStoredProgramSlug } from "@/lib/program";
import { MOCK_QUESTIONS_PER_SUBJECT } from "@/lib/mock-exams";
import { resolveResultProgram } from "@/lib/result-program";
import {
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  saveQuizResultLocal,
  pruneExpiredScratchKeys,
} from "@/lib/storage";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  Eraser,
  LayoutGrid,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from "lucide-react";
import { AppError, AppLoading } from "@/components/app-state";

/**
 * First subject of a programme — used when a session has no usable config
 * (a stale link, or storage cleared) and still has to show something. Falls
 * back to the programme's own syllabus rather than the pharmacy bank the app
 * was originally built around.
 */
function firstSubjectSlug(slug?: string | null): string {
  return (
    getSubjectsForProgram(slug || DEFAULT_PROGRAM_SLUG)[0]?.slug ?? ""
  );
}

type QuizConfig = {
  mode?: "mock" | "mistakes" | string;
  subject?: string;
  program?: string;
  timeLimit?: number | null;
  negativeMarking?: boolean;
  revisionMode?: boolean;
  [key: string]: unknown;
};

export default function ActiveQuizPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showResumedBanner, setShowResumedBanner] = useState(false);
  const [loadError, setLoadError] = useState(false);
  // Bumped by "Try Again" to re-run the loading effect after a failed fetch.
  const [reloadKey, setReloadKey] = useState(0);
  const answersRef = useRef<(number | null)[]>([]);
  const submittingRef = useRef(false);
  const timeLeftRef = useRef<number | null>(null);
  const submitRef = useRef<() => void>(() => {});
  const { user } = useAuth();
  const isMock = quizConfig?.mode === "mock";

  useEffect(() => {
    let cancelled = false;

    (async () => {
      pruneExpiredScratchKeys();

      // Already completed on this device (e.g. user pressed Back after
      // submitting) — go straight to results instead of letting them
      // re-submit and double-count a quiz.
      if (safeGetItem(`quiz-results-${sessionId}`)) {
        router.replace(`/quiz/${sessionId}/results`);
        return;
      }

      try {
        // Read config using the actual session ID from URL
        const stored = safeGetItem(`quiz-config-${sessionId}`);

        if (!stored) {
          const subjectSlug = firstSubjectSlug(getStoredProgramSlug());
          if (!subjectSlug) {
            if (!cancelled) setLoadError(true);
            return;
          }
          const qs = await getQuestionsForQuiz({
            subjectSlug,
            unitIds: [],
            difficulty: "mixed",
            numQuestions: 12,
          });
          if (cancelled) return;
          setQuestions(qs);
          setAnswers(new Array(qs.length).fill(null));
          return;
        }

        const config = JSON.parse(stored);
        if (cancelled) return;
        setQuizConfig(config);

        let finalQs: QuizQuestion[] = [];
        if (config.mode === "mock" || config.mode === "mistakes") {
          // A pre-seeded paper must stay identical across refreshes so crash-resume
          // keeps the same questions. Snapshot the first generated set.
          const snapshot = safeGetItem(`quiz-questions-${sessionId}`);
          if (snapshot) {
            try {
              finalQs = JSON.parse(snapshot);
            } catch {
              finalQs = [];
            }
          }
          if (finalQs.length === 0 && config.mode === "mock") {
            finalQs = await getMockQuestions(
              MOCK_QUESTIONS_PER_SUBJECT,
              // Older configs (started before programmes existed) carry no
              // programme; resolve it from whatever the paper is drawn from.
              resolveResultProgram(config.program, "")
            );
            if (cancelled) return;
            safeSetItem(`quiz-questions-${sessionId}`, JSON.stringify(finalQs));
          }
        } else {
          finalQs = await getQuestionsForQuiz({
            subjectSlug: config.subject,
            unitIds: config.units || [],
            difficulty: config.difficulty || "mixed",
            numQuestions: config.numQuestions || 20,
          });
        }
        if (cancelled) return;

        if (finalQs.length === 0) {
          const subjectSlug = firstSubjectSlug(config.program);
          if (subjectSlug) {
            finalQs = await getQuestionsForQuiz({
              subjectSlug,
              unitIds: [],
              difficulty: "mixed",
              numQuestions: 12,
            });
          }
          if (cancelled) return;
        }
        setQuestions(finalQs);

        // Try to restore saved progress (crash recovery)
        const savedProgress = safeGetItem(`quiz-progress-${sessionId}`);
        if (savedProgress) {
          try {
            const progress = JSON.parse(savedProgress);
            if (
              progress.savedAt &&
              Date.now() - progress.savedAt < 4 * 60 * 60 * 1000 &&
              progress.answers?.length === finalQs.length
            ) {
              setAnswers(progress.answers);
              setCurrentIndex(progress.currentIndex || 0);
              setMarkedForReview(new Set(progress.markedForReview || []));
              if (config.timeLimit && progress.timeLeft != null && progress.timeLeft > 0) {
                setTimeLeft(progress.timeLeft);
              } else if (config.timeLimit) {
                setTimeLeft(config.timeLimit * 60);
              }
              return;
            }
          } catch {}
        }

        // Fresh start
        setAnswers(new Array(Math.max(finalQs.length, 1)).fill(null));
        if (config.timeLimit) {
          setTimeLeft(config.timeLimit * 60);
        }
      } catch (err) {
        // Banks load over the network now, so a failed chunk fetch would
        // otherwise leave the user on "Loading MCQs..." forever.
        console.error("Failed to load quiz questions:", err);
        if (!cancelled) setLoadError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Loads the session exactly once: the programme is read at run time (never
    // as a dependency), so switching programme mid-quiz can't regenerate the
    // paper a student is already sitting.
  }, [sessionId, router, reloadKey]);

  // Keep answersRef in sync with answers state
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Keep timeLeftRef fresh for the submit callback
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Save quiz progress to localStorage on every change (crash recovery)
  useEffect(() => {
    if (questions.length === 0 || answers.every((a) => a === null)) return;
    const progress = {
      answers,
      currentIndex,
      markedForReview: Array.from(markedForReview),
      timeLeft,
      savedAt: Date.now(),
    };
    safeSetItem(`quiz-progress-${sessionId}`, JSON.stringify(progress));
  }, [answers, currentIndex, markedForReview, timeLeft, questions.length, sessionId]);

  const doSubmit = useCallback(
    async (currentAnswers: (number | null)[]) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setIsSubmitting(true);

      try {
        const results = questions.map((q, i) => ({
          questionId: q.id,
          selected: currentAnswers[i],
          correct: q.correctIndex,
          isCorrect: currentAnswers[i] === q.correctIndex,
        }));

        const correct = results.filter((r) => r.isCorrect).length;
        const incorrect = results.filter((r) => !r.isCorrect && r.selected !== null).length;
        const total = results.length;
        // Apply negative marking: deduct 1 mark per wrong answer (min 0)
        const score = quizConfig?.negativeMarking ? Math.max(0, correct - incorrect) : correct;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        const timeTaken = quizConfig?.timeLimit
          ? quizConfig.timeLimit * 60 - (timeLeftRef.current || 0)
          : null;

        // Which programme this result counts towards. Resolved rather than
        // read straight off the config so sessions started before the
        // programme field existed still file themselves correctly.
        const program = resolveResultProgram(
          quizConfig?.program,
          quizConfig?.subject || ""
        );

        // Save to localStorage for results page AND analytics. Failure here
        // must never block submission — it just means no detailed review.
        try {
          saveQuizResultLocal(sessionId, {
            answers: results,
            questions,
            config: {
              ...quizConfig,
              program,
              completedAt: new Date().toISOString(),
            },
            score,
            incorrect,
            timeTaken,
          });
        } catch (err) {
          console.warn("Local quiz result save failed:", err);
        }

        // Mock tests stay out of per-subject stats/leaderboards so
        // 10-question mock rows can't inflate a subject board unfairly.
        if (quizConfig?.mode !== "mock" && user) {
          try {
            const base = {
              p_user_id: user.id,
              p_subject: quizConfig?.subject || "unknown",
              p_score: score,
              p_total: total,
              p_correct: correct,
              p_accuracy: accuracy,
              p_time_taken: timeTaken,
            };
            let { error: rpcError } = await supabase.rpc("save_quiz_result", {
              ...base,
              p_program: program,
            });
            if (rpcError) {
              // Pre-008 deployment — `p_program` doesn't exist yet, so retry
              // with the original 7-argument signature.
              ({ error: rpcError } = await supabase.rpc("save_quiz_result", base));
            }
            if (rpcError) {
              console.warn("RPC save failed, trying direct insert:", rpcError.message);
              const row = {
                user_id: user.id,
                subject: quizConfig?.subject || "unknown",
                score: score,
                total,
                correct,
                accuracy,
                time_taken: timeTaken,
              };
              let { error: insertError } = await supabase
                .from("quiz_results")
                .insert({ ...row, program });
              if (insertError) {
                ({ error: insertError } = await supabase
                  .from("quiz_results")
                  .insert(row));
              }
              if (insertError) {
                console.warn("Direct insert also failed (localStorage only):", insertError.message);
              }
            }
          } catch (err) {
            console.warn("Supabase save error (using localStorage):", err);
          }
        }

        // Clear saved progress and the mock paper snapshot
        safeRemoveItem(`quiz-progress-${sessionId}`);
        safeRemoveItem(`quiz-questions-${sessionId}`);
        // replace() so the Back button can't return to this page and re-submit
        router.replace(`/quiz/${sessionId}/results`);
      } catch (err) {
        console.error("Quiz submit failed:", err);
        submittingRef.current = false;
        setIsSubmitting(false);
        setShowSubmitConfirm(false);
      }
    },
    [questions, quizConfig, router, sessionId, user]
  );

  const handleSubmit = useCallback(() => {
    doSubmit(answersRef.current);
  }, [doSubmit]);

  // Always point submitRef at the latest handleSubmit
  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

  // Countdown timer — decrements every second; submits automatically at 0.
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      submitRef.current();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev === null || prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswer = useCallback((index: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = index;
      return next;
    });
    if (quizConfig?.revisionMode) {
      setShowExplanation(true);
    }
  }, [currentIndex, quizConfig?.revisionMode]);

  const handleClear = () => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = null;
      return next;
    });
    setShowExplanation(false);
  };

  // Check for restored progress on mount
  useEffect(() => {
    const saved = safeGetItem(`quiz-progress-${sessionId}`);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.savedAt && Date.now() - p.savedAt < 4 * 60 * 60 * 1000) {
          const showTimer = setTimeout(() => setShowResumedBanner(true), 0);
          const hideTimer = setTimeout(() => setShowResumedBanner(false), 4000);
          return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
          };
        }
      } catch {}
    }
  }, [sessionId]);

  const toggleMark = useCallback(() => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
  }, [currentIndex]);

  // Keyboard navigation on laptop / desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (showSubmitConfirm) return;

      const key = e.key.toLowerCase();
      if (key === "1" || key === "a") handleAnswer(0);
      else if (key === "2" || key === "b") handleAnswer(1);
      else if (key === "3" || key === "c") handleAnswer(2);
      else if (key === "4" || key === "d") handleAnswer(3);
      else if (key === "arrowleft") {
        setShowExplanation(false);
        setCurrentIndex((i) => Math.max(0, i - 1));
      }
      else if (key === "arrowright" || key === "enter") {
        if (currentIndex === questions.length - 1) {
          setShowSubmitConfirm(true);
        } else {
          setShowExplanation(false);
          setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
        }
      } else if (key === "m") {
        toggleMark();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, questions.length, showSubmitConfirm, handleAnswer, toggleMark]);

  if (questions.length === 0) {
    if (loadError) {
      return (
        <AppError
          title="Couldn’t load this quiz"
          description="Your quiz setup is still safe. Try loading the questions again or return to practice."
          onRetry={() => {
            setLoadError(false);
            setReloadKey((k) => k + 1);
          }}
        />
      );
    }
    return <AppLoading label="Loading your questions" />;
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = answers.filter((a) => a !== null).length;
  const progress = (answeredCount / questions.length) * 100;
  const answeredMarkedCount = answers.reduce<number>(
    (acc, a, i) => acc + (a !== null && markedForReview.has(i) ? 1 : 0),
    0
  );
  const markedOnlyCount = markedForReview.size - answeredMarkedCount;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Resumed from crash banner */}
      {showResumedBanner && (
        <div className="mb-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-3 text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
          <span>✅</span>
          <span>Quiz progress restored from where you left off!</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="sticky top-0 z-30 -mx-4 mb-4 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/quiz")}
            className="text-xs text-muted-foreground hover:text-foreground -ml-2 gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Exit
          </Button>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <h1 className="text-sm font-bold sm:text-base">
            {isMock ? "Mock Test" : "MCQ"} {currentIndex + 1} / {questions.length}
          </h1>
          {isMock && currentQuestion.subjectName ? (
            <Badge variant="secondary" className="gap-1 hidden sm:inline-flex">
              <span>{currentQuestion.subjectIcon}</span>
              {currentQuestion.subjectName}
            </Badge>
          ) : (
            <Badge variant="outline" className="hidden sm:inline-flex capitalize text-xs">
              {currentQuestion.difficulty}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {timeLeft !== null && (
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs sm:text-sm font-bold border ${timeLeft < 300 ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400" : "bg-card text-foreground"}`}>
              <Clock className="h-3.5 w-3.5" />
              {formatTime(timeLeft)}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden text-xs"
            onClick={() => setShowPalette((s) => !s)}
          >
            <LayoutGrid className="mr-1 h-3.5 w-3.5" />
            {showPalette ? "Hide Grid" : "Palette"}
          </Button>
          <Button
            size="sm"
            variant="default"
            className="text-xs font-semibold"
            onClick={() => setShowSubmitConfirm(true)}
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Finish
          </Button>
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <span>{answeredCount} of {questions.length} answered</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress
          value={progress}
          aria-label={`${answeredCount} of ${questions.length} questions answered`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Question Area */}
        <div>
          <Card className="overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <p className="text-base font-medium leading-relaxed sm:text-lg">
                {currentIndex + 1}. {currentQuestion.question}
              </p>
              <div className="mt-6 space-y-3">
                {currentQuestion.options.map((option: string, i: number) => (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={answers[currentIndex] === i}
                    aria-label={`Option ${String.fromCharCode(65 + i)}: ${option}`}
                    onClick={() => handleAnswer(i)}
                    className={`flex min-h-14 w-full items-center rounded-xl border p-3.5 text-left transition-all active:scale-[0.99] sm:p-4 ${
                      answers[currentIndex] === i
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "hover:bg-muted/70"
                    }`}
                  >
                    <div className="flex w-full items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                          answers[currentIndex] === i
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm leading-relaxed">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
              {/* Revision Mode: show explanation immediately after answering */}
              {quizConfig?.revisionMode && showExplanation && answers[currentIndex] !== null ? (
                <div className={`mt-6 rounded-xl p-4 text-sm border ${
                  answers[currentIndex] === currentQuestion.correctIndex
                    ? "bg-green-500/10 text-green-900 dark:text-green-300 border-green-500/30"
                    : "bg-red-500/10 text-red-900 dark:text-red-300 border-red-500/30"
                }`}>
                  <div className="flex items-center gap-2 mb-2 font-semibold text-xs sm:text-sm">
                    {answers[currentIndex] === currentQuestion.correctIndex ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                        <span>Correct Answer</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                        <span>Incorrect. Correct answer: <strong>{String.fromCharCode(65 + currentQuestion.correctIndex)}. {currentQuestion.options[currentQuestion.correctIndex]}</strong></span>
                      </>
                    )}
                  </div>
                  <div className="mt-2.5 flex items-start gap-2 text-xs sm:text-sm border-t border-border/40 pt-2.5">
                    <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-foreground">Explanation:</strong>{" "}
                      <span>{currentQuestion.explanation}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-xl bg-muted/40 p-3.5 text-xs text-muted-foreground flex items-center gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>{quizConfig?.revisionMode ? "Select an option to reveal the verified explanation." : "Detailed explanations will unlock on the submission results screen."}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Controls: Sticky bottom bar on mobile, static on desktop */}
          <div className="sticky bottom-0 z-30 mt-6 -mx-4 -mb-6 border-t bg-background p-3.5 sm:static sm:mx-0 sm:mb-0 sm:border-0 sm:bg-transparent sm:p-0 shadow-sm sm:shadow-none">
            <div className="mb-2 flex items-center justify-center gap-3 text-[11px] text-muted-foreground sm:hidden">
              <span>{questions.length - answeredCount} unanswered</span>
              {markedForReview.size > 0 && (
                <span className="text-amber-600 dark:text-amber-400">
                  {markedForReview.size} for review
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowExplanation(false);
                setCurrentIndex((i) => Math.max(0, i - 1));
              }}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            {answers[currentIndex] !== null && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs text-muted-foreground" aria-label="Clear selected answer">
                <Eraser className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              aria-label={markedForReview.has(currentIndex) ? "Remove review mark" : "Mark for review"}
              onClick={toggleMark}
              className={markedForReview.has(currentIndex) ? "border-amber-500 text-amber-600" : ""}
            >
              <Flag className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">{markedForReview.has(currentIndex) ? "Marked" : "Review"}</span>
            </Button>
            {currentIndex === questions.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setShowSubmitConfirm(true)}
                className="flex-1 bg-primary font-semibold sm:flex-none"
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Submit
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setShowExplanation(false);
                  setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
                }}
                className="flex-1 font-semibold sm:flex-none"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
            </div>
          </div>

          {/* Desktop keyboard hint */}
          <p className="mt-3 hidden sm:block text-center text-[11px] text-muted-foreground/70">
            Keyboard shortcuts: Press <kbd className="rounded border bg-muted px-1">1-4</kbd> or <kbd className="rounded border bg-muted px-1">A-D</kbd> to select &middot; <kbd className="rounded border bg-muted px-1">←</kbd> <kbd className="rounded border bg-muted px-1">→</kbd> to navigate &middot; <kbd className="rounded border bg-muted px-1">M</kbd> to flag
          </p>
          {/* Mobile question palette (toggled from the header) */}
          {showPalette && (
            <div className="mt-4 lg:hidden">
              <Card>
                <CardContent className="p-4">
                  <p className="mb-3 text-sm font-medium">Question Palette</p>
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                    {questions.map((_, i) => {
                      let colorClass = "bg-muted hover:bg-muted/80";
                      if (answers[i] !== null) colorClass = "bg-green-500 text-white";
                      if (markedForReview.has(i)) colorClass = "bg-yellow-500 text-white";
                      if (answers[i] !== null && markedForReview.has(i)) colorClass = "bg-blue-500 text-white";
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setShowExplanation(false);
                            setCurrentIndex(i);
                          }}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                            currentIndex === i
                              ? "ring-2 ring-primary ring-offset-2 " + colorClass
                              : colorClass
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded bg-green-500" />
                      Answered ({answeredCount})
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded bg-blue-500" />
                      Answered &amp; marked ({answeredMarkedCount})
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded bg-yellow-500" />
                      Marked for review ({markedOnlyCount})
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded bg-muted" />
                      Unanswered ({questions.length - answeredCount})
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Question Palette */}
        <div className="hidden lg:block">
          <Card>
            <CardContent className="p-4">
              <p className="mb-3 text-sm font-medium">Question Palette</p>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, i) => {
                  let colorClass = "bg-muted hover:bg-muted/80";
                  if (answers[i] !== null) colorClass = "bg-green-500 text-white";
                  if (markedForReview.has(i)) colorClass = "bg-yellow-500 text-white";
                  if (answers[i] !== null && markedForReview.has(i)) colorClass = "bg-blue-500 text-white";
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setShowExplanation(false);
                        setCurrentIndex(i);
                      }}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                        currentIndex === i
                          ? "ring-2 ring-primary ring-offset-2 " + colorClass
                          : colorClass
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-green-500" />
                  Answered ({answeredCount})
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-blue-500" />
                  Answered &amp; marked ({answeredMarkedCount})
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-yellow-500" />
                  Marked for review ({markedOnlyCount})
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-muted" />
                  Unanswered ({questions.length - answeredCount})
                </div>
              </div>
            </CardContent>
          </Card>
          <Button className="mt-4 w-full" onClick={() => setShowSubmitConfirm(true)}>
            <Send className="mr-2 h-4 w-4" />
            {isMock ? "Submit Mock Test" : "Submit Quiz"}
          </Button>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <h2 className="text-lg font-semibold">
                  {isMock ? "Finish Mock Test?" : "Submit MCQs?"}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                You have answered {answeredCount} out of {questions.length} questions.
              </p>
              {answeredCount < questions.length && (
                <p className="text-sm text-yellow-600 mb-4">
                  ⚠️ {questions.length - answeredCount} questions are unanswered.
                </p>
              )}
              {markedForReview.size > 0 && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                  📌 {markedForReview.size} question(s) marked for review.
                </p>
              )}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowSubmitConfirm(false)}>
                  {isMock ? "Continue Test" : "Continue MCQs"}
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Confirm Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
