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
} from "lucide-react";

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
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizConfig, setQuizConfig] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showResumedBanner, setShowResumedBanner] = useState(false);
  const answersRef = useRef<(number | null)[]>([]);
  const submittingRef = useRef(false);
  const timeLeftRef = useRef<number | null>(null);
  const submitRef = useRef<() => void>(() => {});
  const { user } = useAuth();
  const isMock = quizConfig?.mode === "mock";

  useEffect(() => {
    pruneExpiredScratchKeys();

    // Already completed on this device (e.g. user pressed Back after
    // submitting) — go straight to results instead of letting them
    // re-submit and double-count a quiz.
    if (safeGetItem(`quiz-results-${sessionId}`)) {
      router.replace(`/quiz/${sessionId}/results`);
      return;
    }

    // Read config using the actual session ID from URL
    const stored = safeGetItem(`quiz-config-${sessionId}`);
    if (stored) {
      const config = JSON.parse(stored);
      setQuizConfig(config);
      let finalQs: QuizQuestion[] = [];
      if (config.mode === "mock") {
        // A mock paper must stay identical across refreshes so crash-resume
        // keeps the same 80 questions. Snapshot the first generated set.
        const snapshot = safeGetItem(`quiz-questions-${sessionId}`);
        if (snapshot) {
          try {
            finalQs = JSON.parse(snapshot);
          } catch {
            finalQs = [];
          }
        }
        if (finalQs.length === 0) {
          finalQs = getMockQuestions();
          safeSetItem(`quiz-questions-${sessionId}`, JSON.stringify(finalQs));
        }
      } else {
        finalQs = getQuestionsForQuiz(
          config.subject,
          config.units || [],
          config.difficulty || "mixed",
          config.numQuestions || 20
        );
      }
      if (finalQs.length === 0) finalQs = getFallbackQuestions();
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
    } else {
      // Fallback: load all Pharmaceutics questions
      const qs = getQuestionsForQuiz("pharmaceutics-i", [], "mixed", 12);
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(null));
    }
  }, [sessionId, router]);

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

        // Save to localStorage for results page AND analytics. Failure here
        // must never block submission — it just means no detailed review.
        try {
          saveQuizResultLocal(sessionId, {
            answers: results,
            questions,
            config: {
              ...quizConfig,
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
            const { error: rpcError } = await supabase.rpc("save_quiz_result", {
              p_user_id: user.id,
              p_subject: quizConfig?.subject || "unknown",
              p_score: score,
              p_total: total,
              p_correct: correct,
              p_accuracy: accuracy,
              p_time_taken: timeTaken,
            });
            if (rpcError) {
              console.warn("RPC save failed, trying direct insert:", rpcError.message);
              const { error: insertError } = await supabase.from("quiz_results").insert({
                user_id: user.id,
                subject: quizConfig?.subject || "unknown",
                score: score,
                total,
                correct,
                accuracy,
                time_taken: timeTaken,
              });
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

  const handleAnswer = (index: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = index;
      return next;
    });
    if (quizConfig?.revisionMode) {
      setShowExplanation(true);
    }
  };

  const handleClear = () => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = null;
      return next;
    });
    setShowExplanation(false);
  };

  // Reset explanation when navigating
  useEffect(() => {
    setShowExplanation(false);
  }, [currentIndex]);

  // Check for restored progress on mount
  useEffect(() => {
    const saved = safeGetItem(`quiz-progress-${sessionId}`);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.savedAt && Date.now() - p.savedAt < 4 * 60 * 60 * 1000) {
          setShowResumedBanner(true);
          const timer = setTimeout(() => setShowResumedBanner(false), 4000);
          return () => clearTimeout(timer);
        }
      } catch {}
    }
  }, [sessionId]);

  const toggleMark = () => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
  };

  if (questions.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading MCQs...</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/quiz")}>
            Go Back to Setup
          </Button>
        </div>
      </div>
    );
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
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-lg font-semibold">
            {isMock ? "Mock Test" : "MCQ"} {currentIndex + 1} / {questions.length}
          </h1>
          {isMock && currentQuestion.subjectName ? (
            <Badge variant="secondary" className="gap-1">
              <span>{currentQuestion.subjectIcon}</span>
              {currentQuestion.subjectName}
            </Badge>
          ) : (
            <Badge variant="outline">{currentQuestion.difficulty}</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowPalette((s) => !s)}
          >
            <LayoutGrid className="mr-1 h-4 w-4" />
            {showPalette ? "Hide" : "Questions"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSubmitConfirm(true)}
          >
            <Send className="mr-1 h-4 w-4" />
            Finish
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            {answeredCount} answered
          </div>
          {timeLeft !== null && (
            <div className={`flex items-center gap-1 font-mono text-lg font-bold ${timeLeft < 300 ? "text-red-500" : "text-foreground"}`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </div>

      <Progress value={progress} className="mb-6" />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Question Area */}
        <div>
          <Card>
            <CardContent className="p-6">
              <p className="text-base font-medium leading-relaxed">
                {currentIndex + 1}. {currentQuestion.question}
              </p>
              <div className="mt-6 space-y-3">
                {currentQuestion.options.map((option: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={`w-full rounded-lg border p-4 text-left transition-all ${
                      answers[currentIndex] === i
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium ${
                          answers[currentIndex] === i
                            ? "border-primary bg-primary text-primary-foreground"
                            : ""
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
              {/* Revision Mode: show explanation immediately after answering */}
              {quizConfig?.revisionMode && showExplanation && answers[currentIndex] !== null ? (
                <div className={`mt-6 rounded-lg p-4 text-sm ${
                  answers[currentIndex] === currentQuestion.correctIndex
                    ? "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                }`}>
                  <div className="flex items-center gap-2 mb-2 font-medium">
                    {answers[currentIndex] === currentQuestion.correctIndex ? (
                      <>✅ Correct! Well done.</>
                    ) : (
                      <>❌ Incorrect. The correct answer is <strong>{String.fromCharCode(65 + currentQuestion.correctIndex)}. {currentQuestion.options[currentQuestion.correctIndex]}</strong></>
                    )}
                  </div>
                  <div className="mt-2 opacity-90">
                    💡 <strong>Explanation:</strong> {currentQuestion.explanation}
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                  {quizConfig?.revisionMode ? "💡 Select an answer to see the explanation" : "💡 Explanations will be shown after submission"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            {answers[currentIndex] !== null && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground">
                <Eraser className="mr-1 h-4 w-4" />
                Clear Response
              </Button>
            )}
            <Button variant="outline" onClick={toggleMark}>
              <Flag className="mr-1 h-4 w-4" />
              {markedForReview.has(currentIndex) ? "Unmark" : "Mark for Review"}
            </Button>
            {currentIndex === questions.length - 1 ? (
              <Button onClick={() => setShowSubmitConfirm(true)}>
                <Send className="mr-1 h-4 w-4" />
                {isMock ? "Finish Mock Test" : "Submit MCQs"}
              </Button>
            ) : (
              <Button onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
          {/* Mobile question palette (toggled from the header) */}
          {showPalette && (
            <div className="mt-4 lg:hidden">
              <Card>
                <CardContent className="p-4">
                  <p className="mb-3 text-sm font-medium">Question Palette</p>
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                    {questions.map((_: any, i: number) => {
                      let colorClass = "bg-muted hover:bg-muted/80";
                      if (answers[i] !== null) colorClass = "bg-green-500 text-white";
                      if (markedForReview.has(i)) colorClass = "bg-yellow-500 text-white";
                      if (answers[i] !== null && markedForReview.has(i)) colorClass = "bg-blue-500 text-white";
                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentIndex(i)}
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
                {questions.map((_: any, i: number) => {
                  let colorClass = "bg-muted hover:bg-muted/80";
                  if (answers[i] !== null) colorClass = "bg-green-500 text-white";
                  if (markedForReview.has(i)) colorClass = "bg-yellow-500 text-white";
                  if (answers[i] !== null && markedForReview.has(i)) colorClass = "bg-blue-500 text-white";
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
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
                <Button onClick={handleSubmit} disabled={submittingRef.current}>
                  {submittingRef.current ? "Submitting..." : "Confirm Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function getFallbackQuestions(): QuizQuestion[] {
  return getQuestionsForQuiz("pharmaceutics-i", [], "mixed", 12);
}
