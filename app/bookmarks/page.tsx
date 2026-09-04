"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Bookmark, Eye, EyeOff, Trash2, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/lib/bookmarks";
import { findBankQuestion } from "@/lib/quiz-loader";
import { getSubjectName } from "@/lib/stats";
import { subjects } from "@/data/subjects";

export default function BookmarksPage() {
  const { bookmarks, mounted, removeBookmark } = useBookmarks();

  // For show/hide answers per question — use a simple Set
  const [showAnswers, setShowAnswers] = useState<Set<string>>(new Set());

  // Supabase bookmarks only store slim records (text + subject). Rehydrate
  // full options/answer/explanation from the local question bank so the page
  // actually shows a usable question.
  const enrichedBookmarks = useMemo(
    () =>
      bookmarks.map((b) => {
        if (b.options.length > 0) return b;
        const full = findBankQuestion(b.subjectSlug || undefined, b.questionText);
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
      }),
    [bookmarks]
  );

  const toggleAnswer = (id: string) => {
    setShowAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bookmark className="h-8 w-8" />
          Bookmarks
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your saved questions for quick revision
        </p>
      </div>

      {!mounted ? (
        <div className="text-center py-20 text-muted-foreground">Loading bookmarks...</div>
      ) : bookmarks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No bookmarked questions yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Click the bookmark icon on any question in the Review section to save it here
            </p>
            <Link href="/review">
              <Button>Browse Questions</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {bookmarks.length} bookmarked question{bookmarks.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-4">
            {enrichedBookmarks.map((q) => {
              const subjectName = getSubjectName(q.subjectSlug);
              const subject = subjects.find((s) => s.slug === q.subjectSlug);
              const unitName = subject?.units.find((u) => u.id === q.unitId)?.name || "";

              return (
                <Card key={q.id}>
                  <CardContent className="p-5">
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
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <p className="font-medium">{q.questionText}</p>
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
    </div>
  );
}
