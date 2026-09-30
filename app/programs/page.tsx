import Link from "next/link";
import type { Metadata } from "next";
import { getFacultyCatalogue } from "@/data/registry";
import { getProgrammeQuestionCounts } from "@/lib/quiz-loader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle2, Clock, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Browse every programme on Bujh — CTEVT diploma and certificate programmes plus the +2 streams — and practise the syllabus for yours.",
};

export default async function ProgramsPage() {
  const catalogue = getFacultyCatalogue();
  const questionCounts = await getProgrammeQuestionCounts();

  const totalProgrammes = catalogue.reduce((n, c) => n + c.programs.length, 0);
  const liveProgrammes = catalogue.reduce((n, c) => n + c.availableCount, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <GraduationCap className="h-8 w-8" />
          Programs
        </h1>
        <p className="mt-2 text-muted-foreground">
          {totalProgrammes} programmes across {catalogue.length} streams.{" "}
          {liveProgrammes} {liveProgrammes === 1 ? "has" : "have"} a question
          bank ready — the rest are on the way.
        </p>
      </div>

      <div className="space-y-6">
        {catalogue.map(({ faculty, awards, availableCount }) => (
          <Card key={faculty.slug}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
                <span className="text-2xl">{faculty.icon}</span>
                {faculty.name}
                {availableCount > 0 ? (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {availableCount} available
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs font-normal">
                    coming soon
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {faculty.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {awards.map((award) => (
                <div key={award.award}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {award.icon} {award.award}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {award.programs.map((program) => {
                      const count = questionCounts[program.slug] ?? 0;
                      const body = (
                        <Card
                          className={
                            "h-full transition-all cursor-pointer hover:shadow-md " +
                            (program.hasContent
                              ? "hover:border-primary/40"
                              : "border-dashed hover:border-amber-500/50 bg-card/60 hover:bg-card")
                          }
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <span className="text-xl">{program.icon}</span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-medium text-foreground">
                                    {program.name}
                                    {program.level ? ` · ${program.level}` : ""}
                                  </p>
                                </div>
                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                  {program.description}
                                </p>
                                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                  {program.hasContent ? (
                                    <>
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        <BookOpen className="mr-1 h-3 w-3" />
                                        {count} questions
                                      </Badge>
                                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Ready
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Badge
                                        variant="outline"
                                        className="border-amber-500/30 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-400"
                                      >
                                        <Clock className="mr-1 h-3 w-3" />
                                        In Development
                                      </Badge>
                                      <span className="text-[11px] font-medium text-muted-foreground hover:text-foreground">
                                        View Roadmap &rarr;
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );

                      return (
                        <Link
                          key={program.slug}
                          href={`/programs/${program.slug}`}
                          className="block"
                        >
                          {body}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
