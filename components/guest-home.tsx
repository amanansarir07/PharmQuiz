"use client";

import Link from "next/link";
import { BookOpen, ClipboardCheck, LayoutGrid } from "lucide-react";
import { useActiveProgram } from "@/lib/program";
import { LearningPage, PageHeading, SectionHeading } from "@/components/learning-ui";

export function GuestHome() {
  const { program } = useActiveProgram();

  return <LearningPage className="max-w-[900px] lg:max-w-[1120px]">
    <header className="mb-5 lg:hidden"><h1 className="text-[1.45rem] font-bold leading-tight tracking-tight">Ready to learn?</h1></header>
    <div className="hidden lg:block"><PageHeading eyebrow={program.shortLabel} title="Ready to learn?" description="Start with a short practice session or choose a subject." /></div>
    <div className="lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start lg:gap-12">
      <section className="lg:rounded-xl lg:border lg:border-primary/20 lg:bg-card lg:p-8">
        <h2 className="text-base font-bold lg:text-xl">Start your first practice</h2>
        <p className="mt-1 text-sm text-muted-foreground lg:leading-6"><span className="lg:hidden">Choose a subject and begin.</span><span className="hidden lg:inline">Choose a subject and answer a few questions at your pace.</span></p>
        <Link href="/quiz" className="action-primary mt-4 w-full lg:mt-7 lg:w-auto">Start practice</Link>
      </section>
      <section className="mt-7 lg:mt-0 lg:border-l lg:pl-10">
        <SectionHeading title="Other ways to begin" />
        <div className="divide-y lg:hidden">
          <Link href="/subjects" className="flex min-h-16 items-center gap-3 py-2 hover:text-primary"><BookOpen className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" /><span><span className="block text-sm font-semibold">Subjects</span><span className="mt-0.5 block text-xs text-muted-foreground">Choose a unit to study</span></span></Link>
          <Link href="/mock-test" className="flex min-h-16 items-center gap-3 py-2 hover:text-primary"><ClipboardCheck className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" /><span><span className="block text-sm font-semibold">Mock tests</span><span className="mt-0.5 block text-xs text-muted-foreground">Timed exam practice</span></span></Link>
          <Link href="/review" className="flex min-h-16 items-center gap-3 py-2 hover:text-primary"><LayoutGrid className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" /><span><span className="block text-sm font-semibold">Question bank</span><span className="mt-0.5 block text-xs text-muted-foreground">Find answers and explanations</span></span></Link>
        </div>
        <div className="hidden divide-y border-y border-b-0 lg:block">
          <Link href="/subjects" className="flex min-h-14 flex-col items-start gap-1 py-4 text-base font-semibold hover:text-primary"><span>Browse subjects</span><span className="text-sm font-normal leading-5 text-muted-foreground">Choose a unit from your programme syllabus.</span></Link>
          <Link href="/mock-test" className="flex min-h-14 flex-col items-start gap-1 py-4 text-base font-semibold hover:text-primary"><span>Mock tests</span><span className="text-sm font-normal leading-5 text-muted-foreground">Try a timed paper across your subjects.</span></Link>
          <Link href="/review" className="flex min-h-14 flex-col items-start gap-1 py-4 text-base font-semibold hover:text-primary"><span>Question bank</span><span className="text-sm font-normal leading-5 text-muted-foreground">Find a question and review its explanation.</span></Link>
        </div>
      </section>
    </div>
    <div className="mt-5 border-t pt-2 text-sm lg:mt-10 lg:flex lg:flex-wrap lg:items-center lg:justify-start lg:gap-5 lg:pt-5">
      <p className="text-muted-foreground"><span className="lg:hidden">Save your progress. </span><span className="hidden lg:inline">Save your results and mistakes with a free account.</span><Link href={`/auth/register?program=${encodeURIComponent(program.slug)}`} className="inline-flex min-h-11 items-center font-semibold text-primary lg:hidden">Create an account</Link></p>
      <Link href={`/auth/register?program=${encodeURIComponent(program.slug)}`} className="hidden font-semibold text-primary lg:inline">Create free account</Link>
    </div>
  </LearningPage>;
}
