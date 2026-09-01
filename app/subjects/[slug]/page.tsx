import { notFound } from "next/navigation";
import Link from "next/link";
import { subjects, getSubjectBySlug } from "@/data/subjects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
} from "lucide-react";

export function generateStaticParams() {
  return subjects.map((s) => ({ slug: s.slug }));
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);
  if (!subject) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Back */}
      <Link
        href="/subjects"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        All Subjects
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{subject.icon}</span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {subject.name}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {subject.description}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Badge variant="secondary">
            <BookOpen className="mr-1 h-3 w-3" />
            {subject.units.length} Units
          </Badge>
          <Badge variant="secondary">
            <Award className="mr-1 h-3 w-3" />
            {subject.examMarks} Total Marks
          </Badge>
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {subject.totalHours} Teaching Hours
          </Badge>
        </div>
        <div className="mt-6">
          <Link href={`/quiz?subject=${subject.slug}`}>
            <Button size="lg">
              Start MCQs on {subject.name}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Units */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Units</h2>
        {subject.units.map((unit, index) => (
          <div
            key={unit.id}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold">{unit.name}</h3>
                </div>
                <p className="mt-2 ml-9 text-sm text-muted-foreground">
                  {unit.description}
                </p>
                <div className="mt-3 ml-9 flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="mr-1 h-3 w-3" />
                    {unit.examHours} hrs
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Award className="mr-1 h-3 w-3" />
                    {unit.examMarks} marks
                  </Badge>
                </div>
                {unit.subtopics.length > 0 && (
                  <div className="mt-4 ml-9">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Subtopics ({unit.subtopics.length})
                    </p>
                    <ul className="grid gap-1 sm:grid-cols-2">
                      {unit.subtopics.map((subtopic, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                          {subtopic}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
