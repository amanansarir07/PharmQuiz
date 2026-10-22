"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, BookOpen, Search } from "lucide-react";
import { useActiveProgram } from "@/lib/program";
import { getFaculty, getProgramTotals, getSubjectsForProgram } from "@/data/registry";
import { AppEmpty } from "@/components/app-state";
import { LearningPage, PageHeading, SubjectIcon } from "@/components/learning-ui";

export function SubjectsScreen() {
  const { program } = useActiveProgram();
  const router = useRouter();
  const faculty = getFaculty(program.facultySlug);
  const totals = getProgramTotals(program.slug);
  const subjects = getSubjectsForProgram(program.slug);
  const [search, setSearch] = useState("");
  const filtered = subjects.filter((subject) => subject.name.toLowerCase().includes(search.toLowerCase()));
  const label = program.level ? `${program.name} · ${program.level}` : program.name;

  return <LearningPage>
    <PageHeading eyebrow={faculty?.name || "Your programme"} title="Study" description={`${label} · ${totals.subjects} subjects · ${totals.units} units · ${totals.subtopics} topics`} action={<Link href="/programs" className="text-xs font-semibold text-primary hover:underline">Switch programme</Link>} />
    {subjects.length === 0 ? <AppEmpty title="No subjects published yet" description="Choose another available programme to begin studying." action="Browse programmes" onAction={() => router.push("/programs")} /> : <>
      <label className="mb-5 flex max-w-xl items-center gap-3 rounded-xl border bg-card px-4"><Search className="size-4 shrink-0 text-muted-foreground" /><input className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a subject…" aria-label="Find a subject" /></label>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((subject) => <Link href={`/subjects/${subject.slug}`} key={subject.id} className="group flex items-center gap-3 rounded-2xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md sm:block sm:p-5"><div className="flex items-center justify-between"><SubjectIcon slug={subject.slug} /><ArrowUpRight className="hidden size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block" /></div><div className="min-w-0 flex-1"><h2 className="text-sm font-bold sm:mt-5 sm:text-base">{subject.name}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{subject.units.length} units · {subject.units.reduce((count, unit) => count + unit.subtopics.length, 0)} topics</p><p className="mt-4 hidden border-t pt-3 text-xs font-semibold text-primary sm:block">Explore syllabus →</p></div><ArrowUpRight className="size-4 shrink-0 text-muted-foreground sm:hidden" /></Link>)}</div>
      {filtered.length === 0 && <AppEmpty title="No matching subjects" description="Try another subject name." action="Clear search" onAction={() => setSearch("")} />}
      <Link href="/quiz" className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 text-sm font-semibold text-primary"><BookOpen className="size-4" /> Start practice</Link>
    </>}
  </LearningPage>;
}
