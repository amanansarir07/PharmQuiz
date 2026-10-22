"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck, ClipboardList } from "lucide-react";
import { useActiveProgram } from "@/lib/program";
import { LearningPage, LinkRow, PageHeading, SectionHeading } from "@/components/learning-ui";

export function GuestHome() {
  const { program } = useActiveProgram();

  return <LearningPage className="max-w-5xl">
    <PageHeading title="Start studying" description={`${program.shortLabel} · Choose where to begin.`} />

    <section className="mb-6">
      <div className="rounded-xl border bg-card p-4 sm:p-5">
        <h2 className="text-base font-semibold">Ready for a short practice session?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a subject and answer a few questions.</p>
        <Link href="/quiz" className="action-primary mt-4 w-full sm:w-auto">Start practice <ArrowRight className="size-4" /></Link>
      </div>
    </section>

    <section className="mb-6">
      <SectionHeading title="More ways to study" />
      <div className="overflow-hidden rounded-xl border bg-card">
        <LinkRow href="/mock-test" icon={<ClipboardCheck className="size-5" />} title="Mock tests" detail="Practise in exam format" />
        <LinkRow href="/subjects" icon={<BookOpen className="size-5" />} title="Study the syllabus" detail="Browse subjects, units and topics" />
        <LinkRow href="/review" icon={<ClipboardList className="size-5" />} title="Question bank" detail="Search questions and reveal answers" />
      </div>
    </section>

    <section className="border-t pt-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div><h2 className="text-sm font-semibold">Keep your progress</h2><p className="mt-1 text-sm text-muted-foreground">Create an account to save results, notes and mistakes.</p></div>
      <Link href={`/auth/register?program=${encodeURIComponent(program.slug)}`} className="action-secondary mt-4 w-full sm:mt-0 sm:w-auto">Create free account</Link>
    </section>
    <Link href="/programs" className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline">Change programme</Link>
  </LearningPage>;
}
