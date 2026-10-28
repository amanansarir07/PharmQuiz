"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useActiveProgram } from "@/lib/program";
import { useAuth } from "@/lib/auth";
import { getSubjectsForProgram } from "@/data/registry";
import { calculateStats, type UserStats } from "@/lib/stats";
import { AppEmpty } from "@/components/app-state";
import { LearningPage, PageHeading } from "@/components/learning-ui";
import { getSubjectIcon, HomeListRow } from "@/components/home/home-components";

export function SubjectsScreen() {
  const { program } = useActiveProgram();
  const { user } = useAuth();
  const router = useRouter();
  const subjects = getSubjectsForProgram(program.slug);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [search, setSearch] = useState("");
  const filtered = subjects.filter((subject) => subject.name.toLowerCase().includes(search.toLowerCase()));
  const unitCount = subjects.reduce((count, subject) => count + subject.units.length, 0);

  useEffect(() => {
    let active = true;
    void calculateStats(user?.id, program.slug).then((value) => {
      if (active) setStats(value);
    });
    return () => { active = false; };
  }, [program.slug, user?.id]);

  return <LearningPage>
    <PageHeading eyebrow={program.shortLabel} title="Subjects" description="Choose a subject to explore its units and topics." />
    {subjects.length === 0 ? <AppEmpty title="No subjects published yet" description="You can switch to another available programme in Settings." action="Open settings" onAction={() => router.push("/settings")} /> : <>
      <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">{search ? `${filtered.length} of ${subjects.length} subjects` : `${subjects.length} subjects · ${unitCount} units`}</p>
        <label className="flex min-h-12 w-full items-center gap-3 rounded-full bg-card px-4 shadow-[var(--shadow-card)] transition-colors focus-within:ring-2 focus-within:ring-primary/20 sm:max-w-sm">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a subject…" aria-label="Find a subject" />
          {search && <button type="button" onClick={() => setSearch("")} className="min-h-9 px-1 text-xs font-semibold text-primary">Clear</button>}
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((subject, index) => {
          const performance = stats?.subjectBreakdown[subject.slug];
          const topicCount = subject.units.reduce((count, unit) => count + unit.subtopics.length, 0);
          const detail = `${subject.units.length} units · ${topicCount} topics${performance ? ` · ${performance.total} tried` : ""}`;
          return <HomeListRow key={subject.id} href={`/subjects/${subject.slug}`} icon={getSubjectIcon(subject.slug, subject.name)} colorIndex={index} title={subject.name} detail={detail} progress={performance?.accuracy} monochrome gridCard />;
        })}
      </div>
      {filtered.length === 0 && <AppEmpty title="No matching subjects" description="Try another subject name." action="Clear search" onAction={() => setSearch("")} />}
      <div className="mt-6 border-t pt-4 sm:flex sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Ready to test what you know?</p>
        <Link href="/quiz" className="action-secondary mt-3 w-full sm:mt-0 sm:w-auto">Start practice</Link>
      </div>
    </>}
  </LearningPage>;
}
