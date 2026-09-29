import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  DEFAULT_PROGRAM_SLUG,
  getFaculty,
  getProgram,
  getProgramLabel,
  getProgramTotals,
  getPrograms,
  getSubjectsForProgram,
  isProgramAvailable,
} from "@/data/registry";
import { getQuestionCount } from "@/lib/quiz-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/site";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Award,
  BookOpen,
  ChevronLeft,
  Clock,
  GraduationCap,
  Play,
} from "lucide-react";

export function generateStaticParams() {
  return getPrograms().map((p) => ({ programSlug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ programSlug: string }>;
}): Promise<Metadata> {
  const { programSlug } = await params;
  const program = getProgram(programSlug);
  if (!program) return { title: "Programme not found" };
  const label = getProgramLabel(programSlug);
  return {
    // The layout template appends "— Bujh".
    title: label,
    description: program.description,
    openGraph: {
      title: `${label} — Bujh`,
      description: program.description,
    },
  };
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ programSlug: string }>;
}) {
  const { programSlug } = await params;
  const program = getProgram(programSlug);
  if (!program) notFound();

  const faculty = getFaculty(program.facultySlug);
  const available = isProgramAvailable(program.slug);
  const subjects = getSubjectsForProgram(program.slug);
  const totals = getProgramTotals(program.slug);
  const questionCount = available ? await getQuestionCount(program.slug) : 0;

  const heading = program.level
    ? `${program.name} · ${program.level}`
    : program.name;
  // Single-level awards have the same name as the programme, so showing both
  // in the breadcrumb just repeats itself.
  const showAward = program.award !== heading;

  // Structured data so search engines understand these pages are courses, not
  // blog posts. Only published programmes are marked up as available.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${heading} MCQ practice`,
    description: program.description,
    url: `${SITE_URL}/programs/${program.slug}`,
    inLanguage: "en",
    provider: { "@type": "Organization", name: "Bujh", url: SITE_URL },
    ...(program.level ? { educationalLevel: program.level } : {}),
    ...(available
      ? {
          numberOfCredits: totals.subjects,
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "online",
            courseWorkload: `PT${questionCount}Q`,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/programs"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        All Programs
      </Link>

      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/programs" className="hover:text-foreground">
          Programs
        </Link>
        <span aria-hidden>/</span>
        <span>{faculty?.name ?? program.facultySlug}</span>
        {showAward && (
          <>
            <span aria-hidden>/</span>
            <span>{program.award}</span>
          </>
        )}
        <span aria-hidden>/</span>
        <span className="font-medium text-foreground">{heading}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{program.icon}</span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              {program.description}
            </p>
          </div>
        </div>

        {available ? (
          <>
            <div className="mt-5 flex flex-wrap gap-3">
              <Badge variant="secondary">
                <BookOpen className="mr-1 h-3 w-3" />
                {totals.subjects} Subjects
              </Badge>
              <Badge variant="secondary">
                <Award className="mr-1 h-3 w-3" />
                {totals.examMarks} Total Marks
              </Badge>
              <Badge variant="secondary">
                <Clock className="mr-1 h-3 w-3" />
                {totals.totalHours} Teaching Hours
              </Badge>
              <Badge variant="outline">{questionCount} Questions</Badge>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/quiz">
                <Button size="lg">
                  <Play className="mr-2 h-4 w-4" />
                  Practice MCQs
                </Button>
              </Link>
              <Link href="/mock-test">
                <Button size="lg" variant="outline">
                  Take a Mock Test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <Card className="mt-5 border-dashed">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-semibold">
                    This programme&apos;s question bank is coming soon
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {program.name}
                    {program.level ? ` ${program.level}` : ""} is on the
                    roadmap but its syllabus and MCQs haven&apos;t been added
                    yet. You can keep practising{" "}
                    {getProgram(DEFAULT_PROGRAM_SLUG)?.name}{" "}
                    {getProgram(DEFAULT_PROGRAM_SLUG)?.level} in the meantime.
                  </p>
                  <Link href="/subjects" className="mt-4 inline-block">
                    <Button variant="outline">
                      Go to available subjects
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {available && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <GraduationCap className="h-5 w-5" />
            Subjects
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {subjects.map((subject) => (
              <Link key={subject.id} href={`/subjects/${subject.slug}`}>
                <Card className="h-full transition-all hover:border-primary/20 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{subject.icon}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold">{subject.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {subject.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <BookOpen className="mr-1 h-3 w-3" />
                            {subject.units.length} units
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {subject.examMarks} marks
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
