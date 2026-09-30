"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActiveProgram } from "@/lib/program";
import { useAuth } from "@/lib/auth";
import {
  getFacultyCatalogue,
  getSubjectsForProgram,
  isProgramAvailable,
} from "@/data/registry";
import { CURRICULUM_PREVIEWS } from "@/data/curriculum-previews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Brain,
  Award,
  Zap,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MainScreenSelector({
  questionCounts,
}: {
  questionCounts: Record<string, number>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { programSlug, program, setProgramSlug } = useActiveProgram();
  const catalogue = getFacultyCatalogue();

  // Find which faculty the currently selected program belongs to
  const initialFaculty =
    catalogue.find((f) =>
      f.awards.some((a) => a.programs.some((p) => p.slug === programSlug))
    )?.faculty.slug || "ctevt";

  const [activeFacultySlug, setActiveFacultySlug] = useState<string>(initialFaculty);
  const [isPending, startTransition] = useTransition();

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

  const hasLivePractice = isProgramAvailable(programSlug);
  const liveSubjects = getSubjectsForProgram(programSlug);
  const previewData = CURRICULUM_PREVIEWS[programSlug];
  const questionCount = questionCounts[programSlug] ?? (hasLivePractice ? 800 : 0);

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
            Choose Your Course
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-xl">
            Select your syllabus below. Bujh tailors your subjects, question banks, and mock exams specifically for your department.
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
        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {currentFaculty?.awards.flatMap((award) =>
            award.programs.map((p) => {
              const isSelected = p.slug === programSlug;
              const isLive = p.hasContent;

              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => handleSelectProgram(p.slug)}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/[0.08] shadow-md ring-2 ring-primary/40"
                      : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30 hover:shadow-xs"
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl transition-transform group-hover:scale-110">
                        {p.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-sm text-foreground">
                            {p.name}
                            {p.level ? ` · ${p.level}` : ""}
                          </h3>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {p.award}
                        </p>
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

                  <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="mt-3 flex w-full items-center justify-between border-t pt-2 text-[11px]">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Zap className="h-3 w-3 fill-emerald-500/20" />
                        Live Practice
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <Clock className="h-3 w-3" />
                        Verified Roadmap
                      </span>
                    )}

                    <span
                      className={cn(
                        "font-semibold text-xs transition-colors",
                        isSelected
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {isSelected ? "Selected ✓" : "Tap to choose"}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Step 2: Next Step / Action Deck (Revealed directly below course grid) */}
        <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-card p-4 sm:p-6 shadow-md transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl shadow-xs">
                {program.icon}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-primary">
                    Step 2: Proceed
                  </span>
                  {hasLivePractice ? (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                      Live Practice Ready
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
                      Curriculum Blueprint Live
                    </Badge>
                  )}
                </div>
                <h2 className="mt-1 text-base sm:text-lg font-bold text-foreground">
                  {program.name} {program.level ? `(${program.level})` : ""}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {hasLivePractice
                    ? `${questionCount}+ board questions available with explanations across 8 official subjects.`
                    : `${previewData?.overviewSummary || "Official syllabus outline, curriculum verification pipeline, and unit breakdown."}`}
                </p>
              </div>
            </div>

            {/* Further Step Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:justify-end shrink-0">
              {user ? (
                <>
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button size="default" className="w-full gap-2 font-bold shadow-sm">
                      <Sparkles className="h-4 w-4" />
                      Open My Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>

                  {hasLivePractice && (
                    <Link href="/quiz" className="w-full sm:w-auto">
                      <Button size="default" variant="outline" className="w-full gap-1.5 font-semibold">
                        <Brain className="h-4 w-4 text-primary" />
                        Practice MCQs
                      </Button>
                    </Link>
                  )}

                  <Link href={`/programs/${programSlug}`} className="w-full sm:w-auto">
                    <Button size="default" variant="ghost" className="w-full gap-1.5 text-xs text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                      View Syllabus
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {hasLivePractice ? (
                    <>
                      <Link href="/quiz" className="w-full sm:w-auto">
                        <Button size="default" className="w-full gap-2 font-bold shadow-sm">
                          <Zap className="h-4 w-4" />
                          Start Free Practice Now
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Link href={`/auth/register?program=${programSlug}`} className="w-full sm:w-auto">
                        <Button size="default" variant="outline" className="w-full gap-1.5 font-semibold">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          Enroll / Create Account
                        </Button>
                      </Link>

                      <Link href={`/auth/login?program=${programSlug}`} className="w-full sm:w-auto">
                        <Button size="default" variant="ghost" className="w-full text-xs text-muted-foreground">
                          Sign In
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href={`/programs/${programSlug}`} className="w-full sm:w-auto">
                        <Button size="default" className="w-full gap-2 font-bold shadow-sm">
                          <BookOpen className="h-4 w-4" />
                          View Verified Curriculum Roadmap
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Link href={`/auth/register?program=${programSlug}`} className="w-full sm:w-auto">
                        <Button size="default" variant="outline" className="w-full gap-1.5 font-semibold">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          Register for {program.shortLabel}
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick Subjects Row / Blueprint Preview */}
          <div className="pt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">
                {hasLivePractice ? "Subjects in this curriculum (tap to practice):" : "Official Curriculum Units:"}
              </span>
              <Link href={`/programs/${programSlug}`} className="text-primary hover:underline text-xs font-medium inline-flex items-center gap-1">
                Explore Full Syllabus
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {hasLivePractice ? (
              <div className="flex flex-wrap gap-1.5">
                {liveSubjects.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={`/quiz?subject=${sub.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/30 px-2.5 py-1 text-xs font-medium hover:border-primary/40 hover:bg-card transition-all"
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.name}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      ({sub.units.length} units)
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {previewData?.subjects.slice(0, 5).map((sub) => (
                  <Link
                    key={sub.name}
                    href={`/programs/${programSlug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/20 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.name}</span>
                    <span className="text-[10px] text-primary font-semibold">
                      ({sub.units.length} units)
                    </span>
                  </Link>
                ))}
                {(previewData?.subjects.length || 0) > 5 && (
                  <Link
                    href={`/programs/${programSlug}`}
                    className="inline-flex items-center rounded-lg border border-dashed px-2.5 py-1 text-xs text-muted-foreground hover:text-primary transition-all"
                  >
                    +{(previewData?.subjects.length || 0) - 5} more subjects
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
