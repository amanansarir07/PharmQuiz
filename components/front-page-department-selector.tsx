"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActiveProgram } from "@/lib/program";
import { useAuth } from "@/lib/auth";
import { getFacultyCatalogue, isProgramAvailable } from "@/data/registry";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function FrontPageDepartmentSelector() {
  const router = useRouter();
  const { user } = useAuth();
  const { programSlug, program, setProgramSlug } = useActiveProgram();
  const catalogue = getFacultyCatalogue();

  const handleSelect = (slug: string) => {
    setProgramSlug(slug);
  };

  return (
    <section className="border-b bg-gradient-to-b from-primary/[0.03] to-transparent py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <GraduationCap className="h-4 w-4" />
            <span>Curriculum Selection</span>
          </div>

          <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            Choose Your Department &amp; Course
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Select your syllabus below. Bujh tailors your subjects, question banks, and mock exams specifically for your department.
          </p>

          {/* Active selection badge */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-medium shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">Active Curriculum:</span>
            <span className="font-bold text-foreground">
              {program.icon} {program.shortLabel}
            </span>
            {isProgramAvailable(programSlug) ? (
              <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                Live Practice
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400">
                In Development
              </Badge>
            )}
          </div>
        </div>

        {/* Faculties & Programmes Grid */}
        <div className="mt-8 space-y-8">
          {catalogue.map(({ faculty, awards }) => (
            <div key={faculty.slug} className="rounded-3xl border bg-card/60 p-5 shadow-xs backdrop-blur-xs sm:p-7">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{faculty.icon}</span>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">{faculty.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {faculty.description}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-normal">
                  {awards.reduce((n, a) => n + a.programs.length, 0)} Programmes
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {awards.flatMap((award) =>
                  award.programs.map((p) => {
                    const isSelected = p.slug === programSlug;
                    const hasLiveContent = p.hasContent;

                    return (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => handleSelect(p.slug)}
                        className={cn(
                          "group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/[0.08] shadow-md ring-2 ring-primary/40"
                            : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30 hover:shadow-xs"
                        )}
                      >
                        <div className="flex w-full items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl transition-transform group-hover:scale-110">
                              {p.icon}
                            </span>
                            <div>
                              <h4 className="font-bold text-sm text-foreground">
                                {p.name}
                                {p.level ? ` · ${p.level}` : ""}
                              </h4>
                              <p className="text-[11px] text-muted-foreground line-clamp-1">
                                {p.award}
                              </p>
                            </div>
                          </div>

                          {isSelected ? (
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 shrink-0 rounded-full border border-muted-foreground/30" />
                          )}
                        </div>

                        <p className="mt-2.5 line-clamp-2 text-xs text-muted-foreground">
                          {p.description}
                        </p>

                        <div className="mt-3 flex w-full items-center justify-between border-t pt-2.5 text-[11px]">
                          {hasLiveContent ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Ready for Practice
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                              <Clock className="h-3 w-3" />
                              Curriculum In Dev
                            </span>
                          )}

                          <span className={cn(
                            "font-semibold transition-colors",
                            isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )}>
                            {isSelected ? "Selected ✓" : "Tap to Select"}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Call to Action */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 font-bold shadow-md">
              <Sparkles className="h-4 w-4" />
              Open My Practice Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link href={`/programs/${programSlug}`}>
            <Button size="lg" variant="outline" className="gap-2 font-semibold">
              <BookOpen className="h-4 w-4" />
              View {program.shortLabel} Syllabus
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
