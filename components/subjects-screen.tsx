"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { useActiveProgram } from "@/lib/program";
import { getFaculty, getProgramTotals, getSubjectsForProgram } from "@/data/registry";
import { AppEmpty } from "@/components/app-state";
import { LearningPage, LinkRow, PageHeading } from "@/components/learning-ui";

export function SubjectsScreen() {
  const { program } = useActiveProgram();
  const router = useRouter();
  const faculty = getFaculty(program.facultySlug);
  const totals = getProgramTotals(program.slug);
  const subjects = getSubjectsForProgram(program.slug);
  const label = program.level ? `${program.name} · ${program.level}` : program.name;

  return <LearningPage className="max-w-5xl">
    <PageHeading eyebrow={faculty?.name || "Your programme"} title="Study" description={`${label} · ${totals.subjects} subjects · ${totals.units} units · ${totals.subtopics} topics`} action={<Link href="/programs" className="text-xs font-semibold text-primary hover:underline">Switch programme</Link>} />
    {subjects.length === 0 ? <AppEmpty title="No subjects published yet" description="Choose another available programme to begin studying." action="Browse programmes" onAction={() => router.push("/programs")} /> : <>
      <div className="grid gap-3 md:grid-cols-2">{subjects.map((subject) => <div key={subject.id} className="overflow-hidden rounded-2xl border bg-card"><LinkRow href={`/subjects/${subject.slug}`} icon={<span className="text-xl">{subject.icon}</span>} title={subject.name} detail={`${subject.units.length} units · ${subject.units.reduce((count, unit) => count + unit.subtopics.length, 0)} topics`} /></div>)}</div>
      <Link href="/quiz" className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 text-sm font-semibold text-primary"><BookOpen className="size-4" /> Start practice</Link>
    </>}
  </LearningPage>;
}
