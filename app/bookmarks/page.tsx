"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Eye, EyeOff, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useBookmarks } from "@/lib/bookmarks";
import { findBankQuestion } from "@/lib/quiz-loader";
import { getSubjectBySlug, getSubjectName } from "@/data/registry";
import { LearningPage, PageHeading } from "@/components/learning-ui";
import { AppLoading } from "@/components/app-state";

export default function BookmarksPage() {
  const { bookmarks, mounted, removeBookmark } = useBookmarks();

  // For show/hide answers per question — use a simple Set
  const [showAnswers, setShowAnswers] = useState<Set<string>>(new Set());

  // Supabase bookmarks only store slim records (text + subject). Rehydrate
  // full options/answer/explanation from the local question bank so the page
  // actually shows a usable question. Banks load lazily, so this is async and
  // renders from the slim records until the bank resolves.
  const [enrichedBookmarks, setEnrichedBookmarks] = useState(bookmarks);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const enriched = await Promise.all(
        bookmarks.map(async (b) => {
          if (b.options.length > 0) return b;
          const full = await findBankQuestion(
            b.subjectSlug || undefined,
            b.questionText
          );
          if (full) {
            return {
              ...b,
              options: full.options,
              correctIndex: full.correctIndex,
              explanation: full.explanation,
              difficulty: full.difficulty,
              unitId: full.unitId || b.unitId,
              subjectSlug: full.subjectSlug || b.subjectSlug,
            };
          }
          return b;
        })
      );
      if (!cancelled) setEnrichedBookmarks(enriched);
    })();
    return () => {
      cancelled = true;
    };
  }, [bookmarks]);

  const toggleAnswer = (id: string) => {
    setShowAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <LearningPage className="max-w-5xl">
      <PageHeading eyebrow="Study library" title="Saved questions" description="Questions you kept for quick revision." action={bookmarks.length > 0 && <Link href="/review" className="text-xs font-semibold text-primary hover:underline">Browse question bank</Link>} />

      {!mounted ? (
        <AppLoading label="Loading saved questions" />
      ) : bookmarks.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-8 text-center sm:p-12">
            <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 font-semibold">No saved questions yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Save useful questions from the Question Bank and find them here.
            </p>
            <Link href="/review" className={buttonVariants()}>
              Browse Questions
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {bookmarks.length} bookmarked question{bookmarks.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-3">
            {enrichedBookmarks.map((q) => {
              const subjectName = getSubjectName(q.subjectSlug);
              const subject = q.subjectSlug ? getSubjectBySlug(q.subjectSlug) : undefined;
              const unitName = subject?.units.find((u) => u.id === q.unitId)?.name || "";

              return (
                <Card key={q.id} className="rounded-2xl">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{subjectName}</Badge>
                        {unitName && <Badge variant="outline">{unitName}</Badge>}
                        <Badge
                          variant={
                            q.difficulty === "easy"
                              ? "default"
                              : q.difficulty === "hard"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {q.difficulty}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAnswer(q.id)}
                          aria-label={showAnswers.has(q.id) ? "Hide answer" : "Reveal answer"}
                        >
                          {showAnswers.has(q.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBookmark(q.id)}
                          aria-label="Remove saved question"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold leading-6 sm:text-base">{q.questionText}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, i) => (
                        <div
                          key={i}
                          className={`rounded-lg border p-2 text-sm ${
                            showAnswers.has(q.id) && i === q.correctIndex
                              ? "border-green-500 bg-green-50 dark:bg-green-950"
                              : ""
                          }`}
                        >
                          <span className="font-medium">
                            {String.fromCharCode(65 + i)}.
                          </span>{" "}
                          {opt}
                        </div>
                      ))}
                    </div>
                    {showAnswers.has(q.id) && (
                      <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-sm text-blue-800 dark:text-blue-300">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </LearningPage>
  );
}
