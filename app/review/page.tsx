"use client";

import { useEffect, useMemo, useState } from "react";
import { getProgramQuestions, getSubjectQuestions, type QuizQuestion } from "@/lib/quiz-loader";
import { getSubjectForUnit, getUnitName } from "@/lib/quiz-helpers";
import { useBookmarks } from "@/lib/bookmarks";
import { getSubjectsForProgram } from "@/data/registry";
import { useActiveProgram } from "@/lib/program";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppEmpty, AppError, AppLoading } from "@/components/app-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Bookmark, BookmarkCheck, Eye, EyeOff } from "lucide-react";
import { LearningPage, PageHeading } from "@/components/learning-ui";

export default function ReviewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [showAnswers, setShowAnswers] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(30);
  const [loadError, setLoadError] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { user } = useAuth();
  const { programSlug } = useActiveProgram();
  const subjects = useMemo(
    () => getSubjectsForProgram(programSlug),
    [programSlug]
  );
  const guestSubject = subjects.some((subject) => subject.slug === filterSubject)
    ? filterSubject
    : subjects[0]?.slug;
  const bankKey = user ? programSlug : `${programSlug}/${guestSubject || ""}`;

  // Load the bank once: option order is shuffled at load time, so holding it in
  // state (rather than re-deriving it per render) stops options jumping around
  // while the user types or changes filters. Banks load lazily, hence async.
  //
  // The loaded programme is stored alongside the questions so a programme
  // switch never shows the previous syllabus's bank: questions for the wrong
  // programme read as "still loading" instead.
  const [bank, setBank] = useState<{
    key: string;
    questions: QuizQuestion[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      if (!cancelled) setLoadError(false);
    });
    (user ? getProgramQuestions(programSlug) : guestSubject ? getSubjectQuestions(guestSubject, programSlug) : Promise.resolve([]))
      .then((qs) => {
        if (!cancelled) setBank({ key: bankKey, questions: qs });
      })
      .catch((err) => {
        console.error("Failed to load question bank:", err);
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [programSlug, user, guestSubject, bankKey]);

  const loadingQuestions = bank?.key !== bankKey;
  const allQuestions = loadingQuestions ? [] : bank.questions;

  // A subject filter left over from another programme would match nothing, so
  // fall back to "all" until the student picks one that exists here.
  const activeSubjectFilter =
    filterSubject === "all" || subjects.some((s) => s.slug === filterSubject)
      ? filterSubject
      : "all";
  const selectedSubjectLabel = user && activeSubjectFilter === "all"
    ? "All subjects"
    : subjects.find((subject) => subject.slug === (user ? activeSubjectFilter : guestSubject))?.name || "Select subject";
  const selectedDifficultyLabel = filterDifficulty === "all"
    ? "All levels"
    : filterDifficulty.charAt(0).toUpperCase() + filterDifficulty.slice(1);

  const accessibleQuestions = user ? allQuestions : allQuestions.slice(0, 20);
  const filtered = accessibleQuestions.filter((q) => {
    const matchesSearch =
      !searchQuery ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase());
    const subjectForQ = getSubjectForUnit(q.unitId);
    const matchesSubject =
      activeSubjectFilter === "all" || subjectForQ === activeSubjectFilter;
    const matchesDifficulty =
      filterDifficulty === "all" || q.difficulty === filterDifficulty;
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const toggleAnswer = (id: string) => {
    setShowAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBookmark = (q: QuizQuestion) => {
    const subjectSlug = getSubjectForUnit(q.unitId) || "";
    toggleBookmark({
      questionText: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      difficulty: q.difficulty,
      unitId: q.unitId,
      subjectSlug,
    });
  };

  if (loadingQuestions) {
    return loadError ? (
      <AppError
        title="Question bank unavailable"
        description="We could not load this programme's questions. Please try again."
        onRetry={() => window.location.reload()}
      />
    ) : (
      <AppLoading label="Loading question bank" />
    );
  }

  return (
    <LearningPage className="max-w-5xl">
      <div>
        <PageHeading eyebrow="Study library" title="Question bank" description={user ? `Browse and study ${allQuestions.length} MCQs by subject and unit.` : "Preview up to 20 real questions per subject."} />
        {!user && <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">Create a free account to keep saved questions. <Link href="/auth/register" className="font-semibold text-primary underline underline-offset-2">Create account</Link></p>}
      </div>

      {/* Filters */}
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_200px_150px]">
        <div className="relative col-span-2 sm:col-span-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-10"
          />
        </div>
        <Select value={user ? activeSubjectFilter : guestSubject || "all"} onValueChange={(v) => setFilterSubject(v ?? "all")}>
          <SelectTrigger className="h-11 w-full">
            <SelectValue>{selectedSubjectLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {user && <SelectItem value="all">All subjects</SelectItem>}
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.slug}>
                {s.icon} {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDifficulty} onValueChange={(v) => setFilterDifficulty(v ?? "all")}>
          <SelectTrigger className="h-11 w-full">
            <SelectValue>{selectedDifficultyLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">
        {filtered.length} question(s) found{filtered.length > 30 ? ` (showing ${Math.min(visibleCount, filtered.length)})` : ""}
      </p>

      {/* Questions */}
      <div className="space-y-3">
        {filtered.slice(0, visibleCount).map((q) => {
          const subjectForQ = getSubjectForUnit(q.unitId);
          const subjectName = subjects.find((s) => s.slug === subjectForQ)?.name || "";
          const unitName = getUnitName(q.unitId);
          const bookmarked = isBookmarked(q.question);

          return (
            <Card key={q.id} className="rounded-2xl">
              <CardContent className="p-4 sm:p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    {subjectName && <Badge variant="secondary">{subjectName}</Badge>}
                    <Badge
                      variant={
                        q.difficulty === "hard"
                          ? "destructive"
                          : q.difficulty === "easy"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {q.difficulty}
                    </Badge>
                  </div>
                  {user && <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleBookmark(q)}
                      aria-label={bookmarked ? "Remove bookmark" : "Save question"}
                      title={bookmarked ? "Remove bookmark" : "Bookmark this question"}
                    >
                      {bookmarked ? (
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>}
                </div>
                {unitName && <p className="mb-2 text-xs leading-5 text-muted-foreground">Unit: {unitName}</p>}
                <p className="text-sm font-semibold leading-6 sm:text-base">{q.question}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt: string, i: number) => (
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 min-h-9 gap-2 px-1 text-primary"
                  onClick={() => toggleAnswer(q.id)}
                  aria-label={showAnswers.has(q.id) ? "Hide answer" : "Reveal answer"}
                >
                  {showAnswers.has(q.id) ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  {showAnswers.has(q.id) ? "Hide answer" : "Reveal answer"}
                </Button>
                {showAnswers.has(q.id) && (
                  <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-sm text-blue-800 dark:text-blue-300">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <AppEmpty
            title="No questions found"
            description="Try adjusting your search or filters to find more questions."
          />
        )}
      </div>
      {visibleCount < filtered.length && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((c) => c + 30)}
          >
            Load More ({filtered.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </LearningPage>
  );
}
