"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getQuestionsForQuiz, type QuizQuestion } from "@/lib/quiz-loader";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
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
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizConfig, setQuizConfig] = useState<any>(null);
  const answersRef = useRef<(number | null)[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Read config using the actual session ID from URL
    const stored = localStorage.getItem(`quiz-config-${sessionId}`);
    if (stored) {
      const config = JSON.parse(stored);
      setQuizConfig(config);
      const qs = getQuestionsForQuiz(
        config.subject,
        config.units || [],
        config.difficulty || "mixed",
        config.numQuestions || 20
      );
      setQuestions(qs.length > 0 ? qs : getFallbackQuestions());
      setAnswers(new Array(Math.max(qs.length, 1)).fill(null));
      if (config.timeLimit) {
        setTimeLeft(config.timeLimit * 60);
      }
    } else {
      // Fallback: load all Pharmaceutics questions
      const qs = getQuestionsForQuiz("pharmaceutics-i", [], "mixed", 12);
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(null));
    }
  }, [sessionId]);

  // Keep answersRef in sync with answers state
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          // Use ref for fresh answers to avoid stale closure
          doSubmit(answersRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
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
  };

  const toggleMark = () => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
  };

  const doSubmit = useCallback(
    async (currentAnswers: (number | null)[]) => {
      const results = questions.map((q, i) => ({
        questionId: q.id,
        selected: currentAnswers[i],
        correct: q.correctIndex,
        isCorrect: currentAnswers[i] === q.correctIndex,
      }));

      const correct = results.filter((r) => r.isCorrect).length;
      const total = results.length;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      const timeTaken = quizConfig?.timeLimit
        ? quizConfig.timeLimit * 60 - (timeLeft || 0)
        : null;

      // Save to localStorage for results page AND analytics
      localStorage.setItem(
        `quiz-results-${sessionId}`,
        JSON.stringify({
          answers: results,
          questions,
          config: {
            ...quizConfig,
            completedAt: new Date().toISOString(),
          },
          timeTaken,
        })
      );

      // Save to Supabase for shared stats/leaderboard (non-blocking, best-effort)
      // Uses SECURITY DEFINER function to bypass RLS (publishable key can't do auth.uid())
      if (user) {
        try {
          const { error: rpcError } = await supabase.rpc("save_quiz_result", {
            p_user_id: user.id,
            p_subject: quizConfig?.subject || "unknown",
            p_score: correct,
            p_total: total,
            p_correct: correct,
            p_accuracy: accuracy,
            p_time_taken: timeTaken,
          });
          if (rpcError) {
            // Fallback: try direct INSERT (may fail due to RLS)
            console.warn("RPC save failed, trying direct insert:", rpcError.message);
            const { error: insertError } = await supabase.from("quiz_results").insert({
              user_id: user.id,
              subject: quizConfig?.subject || "unknown",
              score: correct,
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

      router.push(`/quiz/${sessionId}/results`);
    },
    [questions, quizConfig, timeLeft, router, sessionId, user]
  );

  const handleSubmit = useCallback(() => {
    doSubmit(answersRef.current);
  }, [doSubmit]);

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Top Bar */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">
            Question {currentIndex + 1} / {questions.length}
          </h1>
          <Badge variant="outline">{currentQuestion.difficulty}</Badge>
        </div>
        <div className="flex items-center gap-4">
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
              <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                💡 Explanations will be shown after submission
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" onClick={toggleMark}>
              <Flag className="mr-1 h-4 w-4" />
              {markedForReview.has(currentIndex) ? "Unmark" : "Mark for Review"}
            </Button>
            {currentIndex === questions.length - 1 ? (
              <Button onClick={() => setShowSubmitConfirm(true)}>
                <Send className="mr-1 h-4 w-4" />
                Submit MCQs
              </Button>
            ) : (
              <Button onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
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
                  <span className="h-3 w-3 rounded bg-yellow-500" />
                  Marked ({markedForReview.size})
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-muted" />
                  Not visited ({questions.length - answeredCount})
                </div>
              </div>
            </CardContent>
          </Card>
          <Button className="mt-4 w-full" onClick={() => setShowSubmitConfirm(true)}>
            <Send className="mr-2 h-4 w-4" />
            Submit Quiz
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
                <h2 className="text-lg font-semibold">Submit MCQs?</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                You have answered {answeredCount} out of {questions.length} questions.
              </p>
              {answeredCount < questions.length && (
                <p className="text-sm text-yellow-600 mb-4">
                  ⚠️ {questions.length - answeredCount} questions are unanswered.
                </p>
              )}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowSubmitConfirm(false)}>
                  Continue MCQs
                </Button>
                <Button onClick={handleSubmit}>Confirm Submit</Button>
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
