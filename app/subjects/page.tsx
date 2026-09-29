"use client";

import Link from "next/link";
import {
  getFaculty,
  getProgramTotals,
  getSubjectsForProgram,
} from "@/data/registry";
import { useActiveProgram } from "@/lib/program";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";

export default function SubjectsPage() {
  const { program } = useActiveProgram();
  const faculty = getFaculty(program.facultySlug);
  const totals = getProgramTotals(program.slug);
  const subjects = getSubjectsForProgram(program.slug);

  const heading = program.level
    ? `${program.name} · ${program.level}`
    : program.name;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="h-4 w-4" />
          <span>{faculty?.name ?? program.facultySlug}</span>
          <span aria-hidden>/</span>
          <span className="font-medium text-foreground">{heading}</span>
          <Link
            href="/programs"
            className="ml-1 text-primary hover:underline"
          >
            Change program
          </Link>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          All Subjects
        </h1>
        <p className="mt-2 text-muted-foreground">
          {heading} — {totals.subjects} subjects, {totals.units} units,{" "}
          {totals.subtopics} topics
        </p>
      </div>

      {subjects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <p className="font-medium">No subjects published yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {heading} doesn&apos;t have any content yet.
            </p>
            <Link
              href="/programs"
              className="mt-4 inline-block text-sm text-primary hover:underline"
            >
              Browse available programs
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Link key={subject.id} href={`/subjects/${subject.slug}`}>
              <Card className="group h-full cursor-pointer transition-all hover:border-primary/20 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{subject.icon}</span>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold transition-colors group-hover:text-primary">
                        {subject.name}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {subject.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          <BookOpen className="mr-1 h-3 w-3" />
                          {subject.units.length} units
                        </Badge>
                        <Badge variant="outline">{subject.examMarks} marks</Badge>
                        <Badge variant="outline">{subject.totalHours} hrs</Badge>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        View units
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
