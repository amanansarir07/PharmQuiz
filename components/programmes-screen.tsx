"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, CheckCircle2, Clock, GraduationCap } from "lucide-react";
import { getFacultyCatalogue } from "@/data/registry";
import { useActiveProgram } from "@/lib/program";
import { LearningPage, PageHeading, SectionHeading } from "@/components/learning-ui";

export function ProgrammesScreen({ questionCounts }: { questionCounts: Record<string, number> }) {
  const { programSlug, program } = useActiveProgram();
  const catalogue = getFacultyCatalogue();
  const [facultyFilter, setFacultyFilter] = useState("all");
  const available = catalogue.reduce((count, faculty) => count + faculty.availableCount, 0);

  return <LearningPage className="max-w-5xl">
    <PageHeading eyebrow="Find your syllabus" title="Choose programme" description={`${available} programmes ready for practice. Explore CTEVT, Pharmacy Council exams and +2 streams.`} />
    <div className="mb-8 rounded-2xl border border-primary/25 bg-primary/5 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">Currently selected</p>
      <div className="mt-2 flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-card text-xl">{program.icon}</span><div className="min-w-0"><p className="text-sm font-bold">{program.name}{program.level ? ` · ${program.level}` : ""}</p><p className="text-xs text-muted-foreground">Your subjects and quizzes use this syllabus.</p></div></div>
    </div>
    <div className="mb-7 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" aria-label="Filter programmes">{[{ slug: "all", name: "All programmes" }, ...catalogue.map(({ faculty }) => ({ slug: faculty.slug, name: faculty.name }))].map((item) => <button key={item.slug} type="button" aria-pressed={facultyFilter === item.slug} onClick={() => setFacultyFilter(item.slug)} className={`min-h-11 shrink-0 rounded-xl border px-4 text-xs font-semibold ${facultyFilter === item.slug ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:border-primary/40"}`}>{item.name}</button>)}</div>
    <div className="space-y-8">{catalogue.filter(({ faculty }) => facultyFilter === "all" || faculty.slug === facultyFilter).map(({ faculty, awards }) => <section key={faculty.slug}>
      <SectionHeading title={faculty.name} description={faculty.description} />
      <div className="space-y-5">{awards.map((award) => <div key={award.award}>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{award.award}</h3>
        <div className="grid gap-2 md:grid-cols-2">{award.programs.map((item) => {
          const hasCollection = item.slug === "c-pharm";
          return <Link href={`/programs/${item.slug}`} key={item.slug} className={`flex min-h-20 items-center gap-3 rounded-2xl border bg-card p-4 hover:border-primary/40 ${programSlug === item.slug ? "border-primary/50 bg-primary/5" : ""}`}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl">{item.icon}</span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.name}{item.level ? ` · ${item.level}` : ""}</span><span className="mt-1 block text-xs text-muted-foreground">{item.hasContent ? `${questionCounts[item.slug] || 0} questions` : hasCollection ? "Past questions · answers pending" : "Syllabus preview"}</span></span>
            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${item.hasContent ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : hasCollection ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{item.hasContent ? <CheckCircle2 className="size-3" /> : hasCollection ? <BookOpen className="size-3" /> : <Clock className="size-3" />}{item.hasContent ? "Available" : hasCollection ? "Study" : "Soon"}</span>
          </Link>;
        })}</div>
      </div>)}</div>
    </section>)}</div>
    <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"><GraduationCap className="size-4" /> More curricula are added as verified content becomes available.</div>
  </LearningPage>;
}
