"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useActiveProgram } from "@/lib/program";
import { getSubjectsForProgram } from "@/data/registry";
import { AppEmpty } from "@/components/app-state";
import { LearningPage, PageHeading } from "@/components/learning-ui";

export function SubjectsScreen() {
  const { program } = useActiveProgram();
  const router = useRouter();
  const subjects = getSubjectsForProgram(program.slug);
  const [search, setSearch] = useState("");
  const filtered = subjects.filter((subject) => subject.name.toLowerCase().includes(search.toLowerCase()));

  return <LearningPage>
    <PageHeading eyebrow={program.shortLabel} title="Subjects" description="Choose a subject to explore its units and topics." />
    {subjects.length === 0 ? <AppEmpty title="No subjects published yet" description="You can switch to another available programme in Settings." action="Open settings" onAction={() => router.push("/settings")} /> : <>
      <label className="mb-5 flex max-w-xl items-center gap-3 rounded-lg border bg-card px-4"><Search className="size-4 shrink-0 text-muted-foreground" /><input className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a subject…" aria-label="Find a subject" /></label>
      <div className="grid gap-x-8 sm:grid-cols-2">{filtered.map((subject) => <Link href={`/subjects/${subject.slug}`} key={subject.id} className="flex min-h-16 items-center border-b py-3 transition-colors hover:text-primary"><div className="min-w-0"><h2 className="text-sm font-semibold">{subject.name}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{subject.units.length} units · {subject.units.reduce((count, unit) => count + unit.subtopics.length, 0)} topics</p></div></Link>)}</div>
      {filtered.length === 0 && <AppEmpty title="No matching subjects" description="Try another subject name." action="Clear search" onAction={() => setSearch("")} />}
      <Link href="/quiz" className="action-secondary mt-6 w-full sm:w-auto">Start practice</Link>
    </>}
  </LearningPage>;
}
