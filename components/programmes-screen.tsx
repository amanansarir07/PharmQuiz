"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, CheckCircle2, Clock, GraduationCap } from "lucide-react";
import { getFacultyCatalogue } from "@/data/registry";
import { useActiveProgram } from "@/lib/program";
import { LearningPage, PageHeading, SectionHeading } from "@/components/learning-ui";
import { ProgrammeIcon } from "@/components/programme-icon";

export function ProgrammesScreen({ questionCounts }: { questionCounts: Record<string, number> }) {
  const { programSlug, program } = useActiveProgram();
  const catalogue = getFacultyCatalogue();
  const [facultyFilter, setFacultyFilter] = useState("all");
  const available = catalogue.reduce((count, faculty) => count + faculty.availableCount, 0);

  return <LearningPage className="max-w-5xl">
    <PageHeading eyebrow="Find your syllabus" title="Choose programme" description={`${available} programmes ready for practice. Explore CTEVT, Pharmacy Council exams and +2 streams.`} />
    <div className="mb-7 border-b border-primary/20 pb-5">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">Currently selected</p>
      <div className="mt-2 flex items-center gap-3"><ProgrammeIcon program={program} className="size-11" /><div className="min-w-0"><p className="text-sm font-bold">{program.name}{program.level ? ` · ${program.level}` : ""}</p><p className="text-xs text-muted-foreground">Your subjects and quizzes use this syllabus.</p></div></div>
    </div>
    <div className="mb-7 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" aria-label="Filter programmes">{[{ slug: "all", name: "All programmes" }, ...catalogue.map(({ faculty }) => ({ slug: faculty.slug, name: faculty.name }))].map((item) => <button key={item.slug} type="button" aria-pressed={facultyFilter === item.slug} onClick={() => setFacultyFilter(item.slug)} className={`min-h-11 shrink-0 rounded-xl border px-4 text-xs font-semibold ${facultyFilter === item.slug ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:border-primary/40"}`}>{item.name}</button>)}</div>
    <div className="space-y-8">{catalogue.filter(({ faculty }) => facultyFilter === "all" || faculty.slug === facultyFilter).map(({ faculty, awards }) => <section key={faculty.slug}>
      <SectionHeading title={faculty.name} description={faculty.description} />
      <div className="space-y-5">{awards.map((award) => <div key={award.award}>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{award.award}</h3>
        <div className="grid gap-2 md:grid-cols-2">{award.programs.map((item) => {
          const hasCollection = item.slug === "c-pharm";
          const isAvailable = item.hasContent || hasCollection;
          return <Link href={`/programs/${item.slug}`} key={item.slug} className={`flex min-h-20 items-center gap-3 rounded-2xl border bg-card p-4 transition-colors ${isAvailable ? "hover:border-primary/40 hover:bg-primary/[.025]" : "opacity-70 hover:bg-muted/30"} ${programSlug === item.slug ? "border-primary/50 bg-primary/5" : ""}`}>
            <ProgrammeIcon program={item} className="size-10" iconClassName="size-5" />
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.name}{item.level ? ` · ${item.level}` : ""}</span><span className="mt-1 block text-xs text-muted-foreground">{item.hasContent ? `${questionCounts[item.slug] || 0} questions` : hasCollection ? "Past questions · answers pending" : "Syllabus preview"}</span></span>
            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${item.hasContent ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : hasCollection ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{item.hasContent ? <CheckCircle2 className="size-3" /> : hasCollection ? <BookOpen className="size-3" /> : <Clock className="size-3" />}{item.hasContent ? "Available now" : hasCollection ? "Study collection" : "Coming soon"}</span>
          </Link>;
        })}</div>
      </div>)}</div>
    </section>)}</div>
    <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"><GraduationCap className="size-4" /> More curricula are added as verified content becomes available.</div>
  </LearningPage>;
}
