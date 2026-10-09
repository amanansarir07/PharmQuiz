import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
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
import { SITE_URL } from "@/lib/site";
import { getCurriculumPreview } from "@/data/curriculum-previews";
import { CurriculumDevPreview } from "@/components/curriculum-dev-preview";
import { ProgramSelectAction } from "@/components/program-select-action";
import { LearningPage, LinkRow } from "@/components/learning-ui";
import {
  Award,
  BookOpen,
  ChevronLeft,
  Clock,
  GraduationCap,
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
    <LearningPage className="max-w-5xl">
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
            <h1 className="text-[1.65rem] font-bold tracking-tight sm:text-3xl">{heading}</h1>
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
            <div className="mt-6 flex flex-wrap gap-2">
              <ProgramSelectAction slug={program.slug} />
              <ProgramSelectAction slug={program.slug} destination={`/quiz?subject=${encodeURIComponent(subjects[0]?.slug || "")}`} label="Practice MCQs" secondary />
              <ProgramSelectAction slug={program.slug} destination="/mock-test" label="Take a mock test" secondary />
            </div>
          </>
        ) : (
          <div className="mt-6">
            <CurriculumDevPreview
              program={program}
              preview={getCurriculumPreview(program.slug)}
            />
          </div>
        )}
      </div>

      {available && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <GraduationCap className="h-5 w-5" />
            Subjects
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {subjects.map((subject) => (
              <div key={subject.id} className="overflow-hidden rounded-2xl border bg-card"><LinkRow href={`/subjects/${subject.slug}`} icon={<span className="text-xl">{subject.icon}</span>} title={subject.name} detail={`${subject.units.length} units · ${subject.examMarks} marks`} /></div>
            ))}
          </div>
        </div>
      )}
    </LearningPage>
  );
}
