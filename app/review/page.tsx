"use client";

import { useEffect, useMemo, useState } from "react";
import { getProgramQuestions, type QuizQuestion } from "@/lib/quiz-loader";
import { getSubjectForUnit, getUnitName } from "@/lib/quiz-helpers";
import { useBookmarks } from "@/lib/bookmarks";
import { getSubjectName, getSubjectsForProgram } from "@/data/registry";
import { useActiveProgram } from "@/lib/program";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Search, Bookmark, BookmarkCheck, Eye, EyeOff } from "lucide-react";

export default function ReviewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [showAnswers, setShowAnswers] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(30);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { programSlug } = useActiveProgram();
  const subjects = useMemo(
    () => getSubjectsForProgram(programSlug),
    [programSlug]
  );

  // Load the bank once: option order is shuffled at load time, so holding it in
  // state (rather than re-deriving it per render) stops options jumping around
  // while the user types or changes filters. Banks load lazily, hence async.
  //
  // The loaded programme is stored alongside the questions so a programme
  // switch never shows the previous syllabus's bank: questions for the wrong
  // programme read as "still loading" instead.
  const [bank, setBank] = useState<{
    programSlug: string;
    questions: QuizQuestion[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProgramQuestions(programSlug)
      .then((qs) => {
        if (!cancelled) setBank({ programSlug, questions: qs });
      })
      .catch((err) => console.error("Failed to load question bank:", err));
    return () => {
      cancelled = true;
    };
  }, [programSlug]);

  const loadingQuestions = bank?.programSlug !== programSlug;
  const allQuestions = loadingQuestions ? [] : bank.questions;

  // A subject filter left over from another programme would match nothing, so
  // fall back to "all" until the student picks one that exists here.
  const activeSubjectFilter =
    filterSubject === "all" || subjects.some((s) => s.slug === filterSubject)
      ? filterSubject
      : "all";

  const filtered = allQuestions.filter((q) => {
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
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Loading question bank...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Review Questions
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse and study all {allQuestions.length} MCQs by subject and unit
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={activeSubjectFilter} onValueChange={(v) => setFilterSubject(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.slug}>
                {s.icon} {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDifficulty} onValueChange={(v) => setFilterDifficulty(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length} question(s) found{filtered.length > 30 ? ` (showing ${Math.min(visibleCount, filtered.length)})` : ""}
      </p>

      {/* Questions */}
      <div className="space-y-4">
        {filtered.slice(0, visibleCount).map((q) => {
          const subjectForQ = getSubjectForUnit(q.unitId);
          const subjectName = subjects.find((s) => s.slug === subjectForQ)?.name || "";
          const unitName = getUnitName(q.unitId);
          const bookmarked = isBookmarked(q.question);

          return (
            <Card key={q.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {subjectName && <Badge variant="secondary">{subjectName}</Badge>}
                    {unitName && <Badge variant="outline" className="max-w-[200px] truncate">{unitName}</Badge>}
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
                      onClick={() => handleBookmark(q)}
                      title={bookmarked ? "Remove bookmark" : "Bookmark this question"}
                    >
                      {bookmarked ? (
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="font-medium">{q.question}</p>
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
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No questions found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </CardContent>
          </Card>
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
    </div>
  );
}
