import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { getProgramForSubject, getSubjectBySlug } from "@/data/registry";
import { LearningPage, PageHeading, SectionHeading } from "@/components/learning-ui";

export function SubjectDetail({ slug }: { slug: string }) {
  const subject = getSubjectBySlug(slug);
  if (!subject) return null;
  const program = getProgramForSubject(slug);
  const practiceHref = `/quiz?subject=${encodeURIComponent(subject.slug)}`;

  return <LearningPage>
    <PageHeading backHref="/subjects" hideBackOnMobile eyebrow={program?.shortLabel || "Study"} title={subject.name} description={subject.description} />
    <p className="mb-5 text-xs text-muted-foreground">{subject.units.length} units · {subject.units.reduce((sum, unit) => sum + unit.subtopics.length, 0)} topics · {subject.examMarks} exam marks</p>
    <Link href={practiceHref} className="action-primary mb-7 w-full xl:hidden">Practice this subject</Link>
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_240px]">
      <section className="min-w-0">
        <SectionHeading title="Units" description="Open a unit for its topics and focused practice." />
        <div className="divide-y border-y">{subject.units.map((unit, index) => <details key={unit.id} className="group">
          <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 py-3 [&::-webkit-details-marker]:hidden"><span className="w-6 shrink-0 text-sm font-semibold text-muted-foreground">{index + 1}.</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{unit.name}</span><span className="mt-0.5 block text-xs text-muted-foreground">{unit.subtopics.length} topics · {unit.examMarks} marks</span></span><ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" /></summary>
          <div className="pb-5 pl-9"><p className="text-sm leading-6 text-muted-foreground">{unit.description}</p>{unit.subtopics.length > 0 && <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6">{unit.subtopics.map((topic, topicIndex) => <li key={`${unit.id}-${topicIndex}`}>{topic}</li>)}</ul>}<Link href={`${practiceHref}&unit=${encodeURIComponent(unit.id)}`} className="action-secondary mt-4">Practice this unit</Link></div>
        </details>)}</div>
      </section>
      <aside className="hidden border-l pl-6 xl:block"><h2 className="text-sm font-bold">Practice the subject</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Include all units in one session, or choose a unit from the list.</p><Link href={practiceHref} className="action-primary mt-4 w-full">Start practice</Link></aside>
    </div>
  </LearningPage>;
}
