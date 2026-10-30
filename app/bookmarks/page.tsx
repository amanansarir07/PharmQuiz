"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Trash2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useBookmarks } from "@/lib/bookmarks";
import { findBankQuestion } from "@/lib/quiz-loader";
import { getProgramForSubject, getSubjectBySlug, getSubjectName } from "@/data/registry";
import { LibraryNav } from "@/components/library-nav";
import { LearningPage, PageHeading } from "@/components/learning-ui";
import { AppLoading } from "@/components/app-state";
import { toast } from "@/components/ui/toast";

export default function BookmarksPage() {
  const { bookmarks, mounted, error, removeBookmark } = useBookmarks();

  // For show/hide answers per question — use a simple Set
  const [showAnswers, setShowAnswers] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

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
          const programSlug = b.subjectSlug
            ? getProgramForSubject(b.subjectSlug)?.slug
            : undefined;
          const full = await findBankQuestion(
            b.subjectSlug || undefined,
            b.questionText,
            programSlug
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
    <LearningPage className="max-w-[1200px]">
      <PageHeading eyebrow="Study library" title="Saved questions" description="Questions you kept for quick revision." action={bookmarks.length > 0 && <Link href="/review" className="text-xs font-semibold text-primary hover:underline">Browse question bank</Link>} />
      <LibraryNav />
      {bookmarks.length > 0 && <label className="mb-5 flex items-center gap-3 rounded-xl border bg-card px-4"><Search className="size-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none" aria-label="Search saved questions" placeholder="Find a saved question…" /></label>}

      {error && <p role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}

      {!mounted ? (
        <AppLoading label="Loading saved questions" />
      ) : bookmarks.length === 0 ? (
        <div className="flex min-h-[42vh] flex-col items-center justify-center px-4 text-center">
          <h2 className="font-semibold">No saved questions yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">Save useful questions from the question bank and find them here.</p>
          <Link href="/review" className={buttonVariants({ className: "mt-5" })}>Browse questions</Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {bookmarks.length} bookmarked question{bookmarks.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-3">
            {enrichedBookmarks.filter((q) => `${q.questionText} ${getSubjectName(q.subjectSlug)}`.toLowerCase().includes(search.toLowerCase())).map((q) => {
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
                          disabled={removingId === q.id}
                          onClick={async () => { setRemovingId(q.id); const result = await removeBookmark(q.id); setRemovingId(null); if (result.error) toast("Could not remove question", "error", "Try again."); else toast("Saved question removed", "success"); }}
                          aria-label="Remove saved question"
                        >
                          {removingId === q.id ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Trash2 className="h-4 w-4" />}
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
                    <button type="button" onClick={() => toggleAnswer(q.id)} className="mt-3 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary">{showAnswers.has(q.id) ? <EyeOff className="size-4" /> : <Eye className="size-4" />}{showAnswers.has(q.id) ? "Hide explanation" : "Reveal answer & explanation"}</button>
                    {showAnswers.has(q.id) && (
                      <div className="mt-4 rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {enrichedBookmarks.length > 0 && !enrichedBookmarks.some((q) => `${q.questionText} ${getSubjectName(q.subjectSlug)}`.toLowerCase().includes(search.toLowerCase())) && <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No saved questions match “{search}”.</p>}
        </>
      )}
    </LearningPage>
  );
}
