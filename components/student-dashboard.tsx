"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ClipboardCheck, LayoutGrid, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { getSubjectsForProgram, getSubjectName } from "@/data/registry";
import { calculateStats, type UserStats } from "@/lib/stats";
import { getQuizHistory, type HistoryEntry } from "@/lib/history";
import { createMistakesSession, getMistakesCount } from "@/lib/mistakes";
import { LearningPage, LinkRow, PageHeading, SectionHeading } from "@/components/learning-ui";
import { OnboardingDepartmentModal } from "@/components/onboarding-department-modal";

export function StudentDashboard() {
  const { user } = useAuth();
  const { program, programSlug } = useActiveProgram();
  const router = useRouter();
  const subjects = useMemo(() => getSubjectsForProgram(programSlug), [programSlug]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void calculateStats(undefined, programSlug).then((value) => { if (active) setStats(value); });
    void getQuizHistory().then((entries) => { if (active) setHistory(entries.filter((entry) => entry.program === programSlug)); });
    void Promise.resolve().then(() => { if (active) setMistakes(getMistakesCount(programSlug)); });
    void calculateStats(user.id, programSlug).then((value) => { if (active) setStats(value); }).catch(console.error);
    void getQuizHistory(user.id).then((entries) => { if (active) setHistory(entries.filter((entry) => entry.program === programSlug)); }).catch(console.error);
    return () => { active = false; };
  }, [user, programSlug]);

  const recent = history.find((entry) => subjects.some((subject) => subject.slug === entry.subject));
  const recentSubject = recent && subjects.find((subject) => subject.slug === recent.subject);
  const practiceHref = recentSubject ? `/quiz?subject=${encodeURIComponent(recentSubject.slug)}` : "/quiz";
  const startMistakes = () => {
    const sessionId = createMistakesSession(programSlug);
    router.push(sessionId ? `/quiz/${sessionId}` : "/mistakes");
  };

  return <LearningPage className="max-w-[1240px]">
    <OnboardingDepartmentModal />
    <div className="mb-5 lg:hidden"><h1 className="text-[1.45rem] font-bold leading-tight tracking-tight">Hello, {user?.name?.trim().split(/\s+/)[0] || "Student"}</h1></div>
    <div className="hidden lg:block"><PageHeading eyebrow={program.shortLabel} title={`Hello, ${user?.name?.trim().split(/\s+/)[0] || "Student"}`} /></div>
    <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] lg:items-start lg:gap-x-8">
      <div className="contents lg:block">
      <section className="order-1 rounded-xl bg-card/80 px-4 py-5 sm:px-6 lg:px-7 lg:py-7">
        <p className="text-xs font-semibold text-primary">{recent ? "Continue learning" : "Your first step"}</p>
        <h2 className="mt-1 text-[17px] font-bold tracking-tight lg:text-xl">{recent ? getSubjectName(recent.subject) : "Start a practice session"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{recent ? `${recent.correct} of ${recent.total} correct last time. Keep going with this subject.` : "Choose a subject and answer a short set of questions."}</p>
        <Link href={practiceHref} className="action-primary mt-5 w-full sm:w-auto">{recent ? "Practice this subject" : "Start practice"}</Link>
      </section>

      {subjects.length > 0 && <section className="order-3 mt-7 lg:mt-8">
        <SectionHeading title="Subjects" href="/subjects" />
        <div className="divide-y border-y">{subjects.slice(0, 3).map((subject) => {
          const performance = stats?.subjectBreakdown[subject.slug];
          return <LinkRow key={subject.slug} href={`/subjects/${subject.slug}`} title={subject.name} detail={`${subject.units.length} units${performance ? ` · ${performance.total} questions attempted` : ""}`} end={performance ? <span className="text-sm font-semibold tabular-nums text-primary">{performance.accuracy}%</span> : undefined} />;
        })}</div>
      </section>}
      </div>

      <div className="contents lg:block">
      <section className="order-2 mt-7 lg:mt-0">
        <SectionHeading title="Other ways to study" />
        <div className="divide-y border-y">
          <Link href="/subjects" className="flex min-h-16 items-center gap-3 py-2 hover:text-primary"><BookOpen className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" /><span><span className="block text-sm font-semibold">Subjects</span><span className="mt-0.5 block text-xs text-muted-foreground">Choose a unit to study</span></span></Link>
          <Link href="/mock-test" className="flex min-h-16 items-center gap-3 py-2 hover:text-primary"><ClipboardCheck className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" /><span><span className="block text-sm font-semibold">Mock tests</span><span className="mt-0.5 block text-xs text-muted-foreground">Timed exam practice</span></span></Link>
          <button type="button" onClick={startMistakes} className="flex min-h-16 w-full items-center gap-3 py-2 text-left hover:text-primary"><RotateCcw className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" /><span><span className="block text-sm font-semibold">Review mistakes{mistakes > 0 ? ` (${mistakes})` : ""}</span><span className="mt-0.5 block text-xs text-muted-foreground">{mistakes > 0 ? "Practise questions you missed" : "Revisit questions you miss"}</span></span></button>
          <Link href="/review" className="flex min-h-16 items-center gap-3 py-2 hover:text-primary"><LayoutGrid className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" /><span><span className="block text-sm font-semibold">Question bank</span><span className="mt-0.5 block text-xs text-muted-foreground">Find answers and explanations</span></span></Link>
        </div>
      </section>

      <div className="order-4 mt-5 border-t pt-4 text-sm lg:mt-8">
        {stats && stats.quizzesTaken > 0 && <p className="mb-2 text-muted-foreground">{stats.totalAttempted} questions answered · {stats.accuracy}% accuracy</p>}
        <div className="flex flex-wrap gap-x-5 gap-y-1"><Link href="/analytics" className="inline-flex min-h-9 items-center font-semibold text-primary">View progress</Link><Link href="/history" className="inline-flex min-h-9 items-center font-semibold text-primary">History</Link></div>
      </div>
      </div>
    </div>
  </LearningPage>;
}
