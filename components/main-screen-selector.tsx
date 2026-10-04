"use client";

import { Fragment, useState, useTransition } from "react";
import Link from "next/link";
import { useActiveProgram } from "@/lib/program";
import { useAuth } from "@/lib/auth";
import {
  getFacultyCatalogue,
  getSubjectsForProgram,
  isProgramAvailable,
} from "@/data/registry";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Zap,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgramMeta } from "@/data/types";

export function MainScreenSelector({
  questionCounts,
}: {
  questionCounts: Record<string, number>;
}) {
  const { user } = useAuth();
  const { programSlug, setProgramSlug } = useActiveProgram();
  const catalogue = getFacultyCatalogue();

  // Find which faculty the currently selected program belongs to
  const initialFaculty =
    catalogue.find((f) =>
      f.awards.some((a) => a.programs.some((p) => p.slug === programSlug))
    )?.faculty.slug || "ctevt";

  const [activeFacultySlug, setActiveFacultySlug] = useState<string>(initialFaculty);
  const [expandedAward, setExpandedAward] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleSelectProgram = (slug: string) => {
    setProgramSlug(slug);
    // Also save as pending program so registration and Google OAuth pickup without defaulting
    if (typeof window !== "undefined") {
      localStorage.setItem("bujh-pending-program", slug);
      localStorage.setItem("bujh-active-program", slug);
    }
  };

  const currentFaculty = catalogue.find(
    (f) => f.faculty.slug === activeFacultySlug
  ) || catalogue[0];

  const renderProgramAction = (selected: ProgramMeta) => {
    const selectedAvailable = isProgramAvailable(selected.slug);
    const selectedSubjects = getSubjectsForProgram(selected.slug);
    const selectedQuestionCount =
      questionCounts[selected.slug] ?? (selectedAvailable ? 800 : 0);

    return (
      <div className="mt-3 border-t border-border/70 pt-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Selected year
            </span>
            <p className="mt-0.5 truncate text-sm font-bold text-foreground">
              {selected.name} · {selected.level}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {selectedAvailable
                ? `${selectedQuestionCount}+ questions · ${selectedSubjects.length} subjects`
                : "Syllabus preview available"}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "shrink-0 text-[10px] font-semibold",
              selectedAvailable
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {selectedAvailable ? "Available" : "Coming soon"}
          </Badge>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href={selectedAvailable ? "/quiz" : `/programs/${selected.slug}`}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto"
          >
            {selectedAvailable ? <Zap className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
            {selectedAvailable ? "Start practising" : "View syllabus"}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {!user && (
            <Link
              href={`/auth/register?program=${selected.slug}`}
              className="text-center text-xs font-medium text-muted-foreground hover:text-foreground sm:px-2"
            >
              Save your progress
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="bg-gradient-to-b from-primary/[0.04] to-background pt-4 pb-12 sm:pt-6 sm:pb-16 border-b">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Main Title & App Bar (Above the Fold) */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Bujh · CTEVT &amp; +2 Examination Platform</span>
          </div>

          <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            What are you studying?
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-xl">
            Choose a programme to personalise your subjects, practice quizzes, and mock exams.
          </p>

          {/* Department / Stream Switcher Tabs */}
          <div className="mt-4 flex w-full max-w-md items-center justify-center rounded-xl border bg-muted/40 p-1">
            {catalogue.map(({ faculty, awards }) => {
              const isActive = faculty.slug === activeFacultySlug;
              const programTotal = awards.reduce((n, a) => n + a.programs.length, 0);

              return (
                <button
                  key={faculty.slug}
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      setActiveFacultySlug(faculty.slug);
                    });
                  }}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs sm:text-sm font-semibold transition-all",
                    isActive
                      ? "bg-card text-foreground shadow-xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-base">{faculty.icon}</span>
                  <span className="truncate">{faculty.name}</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground font-normal">
                    {programTotal}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Course Cards Grid (Immediately visible, zero swipe required) */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {currentFaculty?.awards.map((award) => {
            const yearPrograms = award.programs.filter((p) => p.level.startsWith("Year"));
            const standalonePrograms = award.programs.filter((p) => !p.level.startsWith("Year"));
            const isGrouped = yearPrograms.length > 1;
            const isExpanded = expandedAward === award.award;
            const selectedProgram = yearPrograms.find((p) => p.slug === programSlug);

            if (isGrouped) {
              return (
                <Fragment key={award.award}>
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-[1.35rem] border bg-card p-3.5 transition-all sm:p-4",
                      isExpanded
                        ? "border-primary/50 bg-primary/[0.025] shadow-sm"
                        : "border-border/80 hover:border-primary/35"
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={`award-${award.award.replace(/\W+/g, "-").toLowerCase()}`}
                      onClick={() => setExpandedAward(isExpanded ? null : award.award)}
                      className="group flex min-h-[64px] w-full items-center justify-between gap-3 rounded-xl px-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl transition-transform group-hover:scale-105">
                          {award.icon}
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-foreground">{award.award}</span>
                          <span className="mt-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {selectedProgram?.level ?? "Choose your year"}
                          </span>
                        </span>
                      </span>
                      <span className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background/70 text-muted-foreground transition-colors",
                        isExpanded && "border-primary/30 text-primary"
                      )}>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </span>
                    </button>

                    {isExpanded && (
                      <div
                        id={`award-${award.award.replace(/\W+/g, "-").toLowerCase()}`}
                        className="mt-3 grid grid-cols-3 gap-2 border-t border-border/70 pt-3"
                      >
                        {yearPrograms.map((p) => {
                          const isSelected = p.slug === programSlug;
                          const isAvailable = p.hasContent;
                          return (
                            <button
                              key={p.slug}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => handleSelectProgram(p.slug)}
                              className={cn(
                                "flex min-h-12 flex-col items-center justify-center rounded-xl border px-1.5 py-2 text-center text-xs font-semibold transition-all active:scale-[0.97]",
                                isSelected && isAvailable
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/15"
                                  : isSelected
                                    ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                    : "border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:bg-background hover:text-foreground"
                              )}
                            >
                              <span>{p.level || p.shortLabel}</span>
                              <span className={cn(
                                "mt-0.5 text-[9px] font-medium",
                                isAvailable ? "opacity-70" : "text-amber-600 dark:text-amber-300"
                              )}>
                                {isSelected ? "Selected" : isAvailable ? "Available" : "Coming soon"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {isExpanded && selectedProgram && renderProgramAction(selectedProgram)}
                  </div>
                  {standalonePrograms.map((p) => {
                    const isSelected = p.slug === programSlug;
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleSelectProgram(p.slug)}
                        className={cn(
                          "group relative flex min-h-[116px] flex-col justify-between rounded-2xl border p-4 text-left transition-all active:scale-[0.99]",
                          isSelected
                            ? "border-primary bg-primary/[0.08] shadow-sm ring-2 ring-primary/25"
                            : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30"
                        )}
                      >
                        <div className="flex w-full items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl transition-transform group-hover:scale-110">{p.icon}</span>
                            <div>
                              <h3 className="font-bold text-sm text-foreground">{p.name}</h3>
                              <p className="text-[11px] text-muted-foreground line-clamp-1">{p.award}</p>
                            </div>
                          </div>
                          {isSelected ? (
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 shrink-0 rounded-full border border-muted-foreground/30" />
                          )}
                        </div>
                        <div className="mt-3 flex w-full items-center justify-end border-t pt-2.5 text-[11px]">
                          <span className={cn("font-semibold text-xs transition-colors", isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
                            {isSelected ? "Selected" : "Choose"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </Fragment>
              );
            }

            const p = award.programs[0];
            const isSelected = p.slug === programSlug;
            return (
              <button
                key={p.slug}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleSelectProgram(p.slug)}
                className={cn(
                  "group relative flex min-h-[116px] flex-col justify-between rounded-2xl border p-4 text-left transition-all active:scale-[0.99]",
                  isSelected
                    ? "border-primary bg-primary/[0.08] shadow-sm ring-2 ring-primary/25"
                    : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl transition-transform group-hover:scale-110">{p.icon}</span>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{p.name}</h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{p.award}</p>
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 shrink-0 rounded-full border border-muted-foreground/30" />
                  )}
                </div>
                <div className="mt-3 flex w-full items-center justify-end border-t pt-2.5 text-[11px]">
                  <span className={cn("font-semibold text-xs transition-colors", isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
                    {isSelected ? "Selected" : "Choose"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
