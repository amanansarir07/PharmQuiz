"use client";

import Link from "next/link";
import { BookOpen, ClipboardCheck, LayoutGrid } from "lucide-react";
import { useActiveProgram } from "@/lib/program";
import { getSubjectsForProgram } from "@/data/registry";
import { LearningPage, LinkRow, PageHeading, SectionHeading } from "@/components/learning-ui";

export function GuestHome() {
  const { program } = useActiveProgram();
  const subjects = getSubjectsForProgram(program.slug);

  return <LearningPage className="max-w-[1240px]">
    <div className="mb-5 lg:hidden"><h1 className="text-[1.45rem] font-bold leading-tight tracking-tight">Ready to learn?</h1></div>
    <div className="hidden lg:block"><PageHeading eyebrow={program.shortLabel} title="Ready to learn?" description="Start with a short practice session or choose a subject." /></div>
    <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] lg:items-start lg:gap-x-8">
      <div className="contents lg:block">
      <section className="order-1 rounded-xl bg-card/80 px-4 py-5 sm:px-6 lg:px-7 lg:py-7">
        <h2 className="text-[17px] font-bold tracking-tight lg:text-xl">Start your first practice</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a subject and answer a short set of questions.</p>
        <Link href="/quiz" className="action-primary mt-5 w-full sm:w-auto">Start practice</Link>
      </section>

      {subjects.length > 0 && <section className="order-3 mt-7 lg:mt-8">
        <SectionHeading title="Subjects" href="/subjects" />
        <div className="divide-y border-y">{subjects.slice(0, 3).map((subject) => <LinkRow key={subject.slug} href={`/subjects/${subject.slug}`} title={subject.name} detail={`${subject.units.length} units`} />)}</div>
      </section>}
      </div>

      <div className="contents lg:block">
      <section className="order-2 mt-7 lg:mt-0">
        <SectionHeading title="Other ways to begin" />
        <div className="divide-y border-y">
          <Link href="/subjects" className="flex min-h-16 items-center gap-3 py-2 hover:text-primary"><BookOpen className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" /><span><span className="block text-sm font-semibold">Subjects</span><span className="mt-0.5 block text-xs text-muted-foreground">Choose a unit to study</span></span></Link>
          <Link href="/mock-test" className="flex min-h-16 items-center gap-3 py-2 hover:text-primary"><ClipboardCheck className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" /><span><span className="block text-sm font-semibold">Mock tests</span><span className="mt-0.5 block text-xs text-muted-foreground">Timed exam practice</span></span></Link>
          <Link href="/review" className="flex min-h-16 items-center gap-3 py-2 hover:text-primary"><LayoutGrid className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" /><span><span className="block text-sm font-semibold">Question bank</span><span className="mt-0.5 block text-xs text-muted-foreground">Find answers and explanations</span></span></Link>
        </div>
      </section>

      <div className="order-4 mt-5 border-t pt-4 text-sm lg:mt-8">
        <p className="text-muted-foreground">Save your results and mistakes with a free account.</p>
        <Link href={`/auth/register?program=${encodeURIComponent(program.slug)}`} className="mt-1 inline-flex min-h-11 items-center font-semibold text-primary">Create free account</Link>
      </div>
      </div>
    </div>
  </LearningPage>;
}
