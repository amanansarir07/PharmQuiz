import Link from "next/link";
import { ArrowRight, BookOpen, ChevronDown } from "lucide-react";
import { getProgramForSubject, getSubjectBySlug } from "@/data/registry";
import { LearningPage, PageHeading, SectionHeading } from "@/components/learning-ui";

export function SubjectDetail({ slug }: { slug: string }) {
  const subject = getSubjectBySlug(slug);
  if (!subject) return null;
  const program = getProgramForSubject(slug);

  return <LearningPage className="max-w-4xl">
    <PageHeading backHref="/subjects" hideBackOnMobile eyebrow={program?.shortLabel || "Study"} title={subject.name} description={subject.description} action={<span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-2xl">{subject.icon}</span>} />
    <div className="mb-7 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground"><span className="rounded-full border bg-card px-3 py-1.5">{subject.units.length} units</span><span className="rounded-full border bg-card px-3 py-1.5">{subject.units.reduce((sum, unit) => sum + unit.subtopics.length, 0)} topics</span><span className="rounded-full border bg-card px-3 py-1.5">{subject.examMarks} exam marks</span></div>
    <Link href={`/quiz?subject=${encodeURIComponent(subject.slug)}`} className="mb-8 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Practise {subject.name}<ArrowRight className="size-4" /></Link>
    <SectionHeading title="Units & topics" description="Open a unit to explore its syllabus and start focused practice." />
    <div className="space-y-2.5">{subject.units.map((unit, index) => <details key={unit.id} className="group overflow-hidden rounded-2xl border bg-card" open={index === 0}>
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">{index + 1}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{unit.name}</span><span className="mt-0.5 block text-xs text-muted-foreground">{unit.subtopics.length} topics · {unit.examMarks} marks</span></span><ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" /></summary>
      <div className="border-t px-4 pb-4 pt-3"><p className="text-sm leading-6 text-muted-foreground">{unit.description}</p>{unit.subtopics.length > 0 && <ul className="mt-3 space-y-1.5">{unit.subtopics.map((topic, topicIndex) => <li key={`${unit.id}-${topicIndex}`} className="flex gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm"><BookOpen className="mt-0.5 size-4 shrink-0 text-primary" /><span>{topic}</span></li>)}</ul>}<Link href={`/quiz?subject=${encodeURIComponent(subject.slug)}&unit=${encodeURIComponent(unit.id)}`} className="mt-4 inline-flex min-h-10 items-center gap-1 rounded-xl border border-primary/30 px-4 text-sm font-semibold text-primary">Practise this unit<ArrowRight className="size-4" /></Link></div>
    </details>)}</div>
  </LearningPage>;
}
