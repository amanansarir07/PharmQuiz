import { notFound, redirect } from "next/navigation";
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
import { getProgramQuestionSubjectSlugs, getQuestionCount } from "@/lib/quiz-loader";
import { Badge } from "@/components/ui/badge";
import { SITE_URL } from "@/lib/site";
import { getCurriculumPreview } from "@/data/curriculum-previews";
import { CurriculumDevPreview } from "@/components/curriculum-dev-preview";
import { ProgramSelectAction } from "@/components/program-select-action";
import { LearningPage, LinkRow, SubjectIcon } from "@/components/learning-ui";
import { ProgrammeIcon } from "@/components/programme-icon";
import {
  Award,
  BookOpen,
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
    // The layout template appends "- Bujh".
    title: label,
    description: program.description,
    openGraph: {
      title: `${label} - Bujh`,
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
  if (programSlug === "c-pharm-y1" || programSlug === "c-pharm-y2" || programSlug === "c-pharm-y3") {
    redirect("/programs/c-pharm");
  }
  const program = getProgram(programSlug);
  if (!program) notFound();

  const faculty = getFaculty(program.facultySlug);
  const available = isProgramAvailable(program.slug);
  const subjects = getSubjectsForProgram(program.slug);
  const totals = getProgramTotals(program.slug);
  const questionCount = available ? await getQuestionCount(program.slug) : 0;
  const questionSubjectSlugs = questionCount > 0
    ? new Set(await getProgramQuestionSubjectSlugs(program.slug))
    : new Set<string>();
  const practiceSubjectSlug = subjects.find((subject) => questionSubjectSlugs.has(subject.slug))?.slug;

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
    ...(available && questionCount > 0
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
        className="mb-6 inline-flex min-h-10 items-center text-sm text-muted-foreground hover:text-foreground"
      >
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

      <div className="mb-8 rounded-3xl border bg-card p-5 sm:p-8">
        <div className="flex items-start gap-4">
          <ProgrammeIcon program={program} className="size-14 rounded-2xl" iconClassName="size-7" />
          <div>
            <h1 className="text-[1.65rem] font-bold tracking-tight sm:text-3xl">{heading}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {program.description}
            </p>
          </div>
        </div>

        {available ? (
          <>
            <div className="mt-5 flex flex-wrap gap-3">
              <Badge variant="secondary">
                <BookOpen className="mr-1 h-3 w-3" />
                {totals.subjects} {totals.subjects === 1 ? "Subject" : "Subjects"}
              </Badge>
              {program.facultySlug !== "plus-two" && totals.examMarks > 0 && <Badge variant="secondary">
                <Award className="mr-1 h-3 w-3" />
                {totals.examMarks} Total Marks
              </Badge>}
              {program.facultySlug !== "plus-two" && totals.totalHours > 0 && <Badge variant="secondary">
                <Clock className="mr-1 h-3 w-3" />
                {totals.totalHours} Teaching Hours
              </Badge>}
              <Badge variant="outline">{questionCount} Questions</Badge>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <ProgramSelectAction slug={program.slug} />
              {practiceSubjectSlug && (
                <ProgramSelectAction slug={program.slug} destination={`/quiz?subject=${encodeURIComponent(practiceSubjectSlug)}`} label="Practice MCQs" secondary />
              )}
              {questionCount > 0 && (
                <ProgramSelectAction slug={program.slug} destination="/mock-test" label="Take a mock test" secondary />
              )}
            </div>
            {questionCount === 0 && <p className="mt-4 text-sm text-muted-foreground">{program.slug === "c-pharm" ? "No published questions could be loaded right now. Please try again." : "The curriculum is ready. MCQs will appear here as they are published."}</p>}
            {questionCount > 0 && !practiceSubjectSlug && <p className="mt-4 text-sm text-muted-foreground">Published questions are not yet linked to a subject in this syllabus.</p>}
            {program.facultySlug === "plus-two" && <p className="mt-3 text-sm text-muted-foreground">Subject combinations vary by school. Choose the subjects you study.</p>}
            {program.slug === "c-pharm" && <p className="mt-4 text-sm text-muted-foreground">{questionCount > 0 && "These published questions are ready for practice. "}Topic-by-topic syllabus mapping is still pending. <a href="https://nepalpharmacycouncil.org.np/Syllabus.html" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2">View the Council syllabus</a>.</p>}
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
            {subjects.map((subject) => {
              const hasQuestions = questionSubjectSlugs.has(subject.slug);
              return <div key={subject.id} className="overflow-hidden rounded-2xl border bg-card"><LinkRow href={`/subjects/${subject.slug}`} icon={<SubjectIcon slug={subject.slug} />} title={subject.name} detail={`${subject.units.length} ${subject.units.length === 1 ? "section" : "units"}${subject.examMarks > 0 ? ` · ${subject.examMarks} marks` : ""} · ${hasQuestions ? "Questions available" : "Question bank coming soon"}`} /></div>;
            })}
          </div>
        </div>
      )}
    </LearningPage>
  );
}
