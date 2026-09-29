"use client";

import Link from "next/link";
import { getProgramTotals, getSubjectsForProgram } from "@/data/registry";
import { useActiveProgram } from "@/lib/program";
import { ArrowRight, BookOpen, Brain, GraduationCap, Trophy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The programme-dependent half of the home page.
 *
 * The marketing shell around it stays a server component so it is still
 * prerendered and crawlable; this part picks the visitor's programme on the
 * client and renders that programme's numbers and syllabus. Question counts
 * arrive as a prop because the banks are lazy `import()`s — the server can
 * await them at build time, a client component cannot.
 */
export function ProgramHome({
  questionCounts,
}: {
  questionCounts: Record<string, number>;
}) {
  const { program, programSlug } = useActiveProgram();
  const totals = getProgramTotals(programSlug);
  const subjects = getSubjectsForProgram(programSlug);
  const questionCount = questionCounts[programSlug] ?? 0;

  const heading = program.level
    ? `${program.name} · ${program.level}`
    : program.name;

  return (
    <>
      {/* Stats Bar */}
      <section className="border-y bg-background">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Subjects", value: totals.subjects, icon: BookOpen },
              { label: "Units", value: totals.units, icon: GraduationCap },
              { label: "Subtopics", value: totals.subtopics, icon: Brain },
              { label: "Questions", value: questionCount, icon: Trophy },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Showing {program.icon} {heading} —{" "}
            <Link href="/programs" className="text-primary hover:underline">
              change programme
            </Link>
          </p>
        </div>
      </section>

      {/* Subjects Preview */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Curriculum Subjects &amp; Units
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              Chapter-by-chapter coverage aligned with the official {heading} board syllabus.
            </p>
          </div>

          {subjects.length === 0 ? (
            <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-dashed p-8 text-center">
              <p className="font-semibold text-base">
                No subjects published for this syllabus yet
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {heading} question banks are currently in preparation. You can explore published syllabi that are ready for practice.
              </p>
              <Link
                href="/programs"
                className={cn(buttonVariants({ variant: "default" }), "mt-5 gap-2")}
              >
                Browse Available Syllabi
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {subjects.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/subjects/${subject.slug}`}
                    className="group rounded-xl border bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{subject.icon}</span>
                      <div>
                        <h3 className="font-semibold transition-colors group-hover:text-primary">
                          {subject.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-muted-foreground">
                          {subject.description}
                        </p>
                        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{subject.units.length} units</span>
                          <span>•</span>
                          <span>{subject.examMarks} marks</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/subjects"
                  className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  View all {totals.subjects} subjects &amp; syllabus units
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
