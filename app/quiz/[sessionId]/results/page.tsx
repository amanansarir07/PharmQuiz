"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
} from "lucide-react";

export default function QuizResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [results, setResults] = useState<any>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`quiz-results-${sessionId}`);
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, [sessionId]);

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

  const correct = results.answers.filter((a: any) => a.isCorrect).length;
  const incorrect = results.answers.filter(
    (a: any) => !a.isCorrect && a.selected !== null
  ).length;
  const unattempted = results.answers.filter(
    (a: any) => a.selected === null
  ).length;
  const total = results.questions.length;
  // Use score from saved results if available (accounts for negative marking)
  const displayScore = results.score ?? correct;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Score Card */}
      <Card className="mb-8">
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            {percentage >= 70 ? (
              <Trophy className="mx-auto h-16 w-16 text-yellow-500" />
            ) : (
              <CheckCircle className="mx-auto h-16 w-16 text-primary" />
            )}
          </div>
          <h1 className="text-3xl font-bold">
            {percentage >= 70
              ? "Great Job! 🎉"
              : percentage >= 50
              ? "Good Effort! 💪"
              : "Keep Practicing! 📚"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here&apos;s how you performed
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-primary/5 p-4">
              <p className="text-3xl font-bold text-primary">{percentage}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
              {results.score !== undefined && results.score !== correct && (
                <p className="mt-1 text-xs text-muted-foreground">Score: {displayScore}/{total} (with negative marking)</p>
              )}
            </div>
            <div className="rounded-xl bg-green-50 dark:bg-green-950 p-4">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{correct}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="rounded-xl bg-red-50 dark:bg-red-950 p-4">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{incorrect}</p>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
            <div className="rounded-xl bg-muted p-4">
              <p className="text-3xl font-bold">{unattempted}</p>
              <p className="text-sm text-muted-foreground">Unattempted</p>
            </div>
          </div>

          <div className="mt-6">
            <Progress value={percentage} className="h-3" />
            <p className="mt-2 text-sm text-muted-foreground">
              {correct} of {total} correct
            </p>
          </div>

          {results.timeTaken !== null && results.timeTaken !== undefined && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Time taken: {formatTime(results.timeTaken)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <Button
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
          Retake Same Quiz
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
          {showAnswers ? "Hide" : "Show"} Detailed Review
        </Button>
      </div>

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
