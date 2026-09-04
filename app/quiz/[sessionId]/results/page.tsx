"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShareResultDialog } from "@/components/share-result-dialog";
import { useAuth } from "@/lib/auth";
import { getSubjectBySlug } from "@/data/subjects";
import {
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Share2,
} from "lucide-react";

export default function QuizResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [results, setResults] = useState<any>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`quiz-results-${sessionId}`);
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, [sessionId]);

  // All derivations stay above the early return so hook order never changes.
  const correct = results
    ? results.answers.filter((a: any) => a.isCorrect).length
    : 0;
  const incorrect = results
    ? results.answers.filter((a: any) => !a.isCorrect && a.selected !== null)
        .length
    : 0;
  const unattempted = results
    ? results.answers.filter((a: any) => a.selected === null).length
    : 0;
  const total = results ? results.questions.length : 0;
  // Use score from saved results if available (accounts for negative marking)
  const displayScore = results ? (results.score ?? correct) : 0;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const shareData = results
    ? (() => {
        const slug = results.config?.subject;
        const subjectName = slug
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
        const metaLine = `${total} questions • ${difficultyLabel} • ${timing}`;
        return {
          userName: user?.name,
          subjectName,
          correct,
          incorrect,
          unattempted,
          total,
          percentage,
          scoreNote:
            results.score !== undefined && results.score !== correct
              ? `Final score ${displayScore}/${total} • negative marking`
              : null,
          metaLine,
        };
      })()
    : null;

  if (!results) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No MCQ results found</p>
          <Link href="/quiz">
            <Button className="mt-4">Start MCQs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Score Card */}
      <Card className="mb-6">
        <CardContent className="p-5 sm:p-8">
          <div className="flex items-center gap-4 mb-4">
            {percentage >= 70 ? (
              <Trophy className="h-10 w-10 sm:h-16 sm:w-16 shrink-0 text-yellow-500" />
            ) : (
              <CheckCircle className="h-10 w-10 sm:h-16 sm:w-16 shrink-0 text-primary" />
            )}
          </div>
          <h1 className="text-xl sm:text-3xl font-bold">
            {percentage >= 70
              ? "Great Job! 🎉"
              : percentage >= 50
              ? "Good Effort! 💪"
              : "Keep Practicing! 📚"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here&apos;s how you performed
          </p>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4 mb-4">
            <div className="rounded-xl bg-primary/5 p-3 sm:p-4 text-center">
              <p className="text-3xl font-bold text-primary">{percentage}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
              {results.score !== undefined && results.score !== correct && (
                <p className="mt-1 text-xs text-muted-foreground">Score: {displayScore}/{total} (with negative marking)</p>
              )}
            </div>
            <div className="rounded-xl bg-green-50 dark:bg-green-950 p-3 sm:p-4 text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{correct}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="rounded-xl bg-red-50 dark:bg-red-950 p-3 sm:p-4 text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{incorrect}</p>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
            <div className="rounded-xl bg-muted p-3 sm:p-4 text-center">
              <p className="text-3xl font-bold">{unattempted}</p>
              <p className="text-sm text-muted-foreground">Unattempted</p>
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
              const { completedAt, ...config } = results.config;
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
              .map((q: any, i: number) => ({ q, answer: results.answers[i], i }))
              .filter(({ answer }: any) => !answer.isCorrect && answer.selected !== null)
              .slice(0, 3)
              .map(({ q, i }: any) => (
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
          {results.questions.map((q: any, i: number) => {
            const answer = results.answers[i];
            const isCorrect = answer.isCorrect;
            const wasSkipped = answer.selected === null;

            return (
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
            );
          })}
        </div>
      )}
    </div>
  );
}
