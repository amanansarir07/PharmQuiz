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

  return <LearningPage className="max-w-[980px] lg:max-w-[1120px]">
    <OnboardingDepartmentModal />
    <header className="mb-5 lg:hidden"><h1 className="text-[1.45rem] font-bold leading-tight tracking-tight">Hello, {user?.name?.trim().split(/\s+/)[0] || "Student"}</h1></header>
    <div className="hidden lg:block"><PageHeading eyebrow={program.shortLabel} title={`Hello, ${user?.name?.trim().split(/\s+/)[0] || "Student"}`} /></div>
    <div className="lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start lg:gap-12">
      <section className="lg:rounded-xl lg:border lg:border-primary/20 lg:bg-card lg:p-8">
        <p className="text-xs font-semibold text-primary">{recent ? "Continue learning" : "Your first step"}</p>
        <h2 className="mt-1 text-base font-bold lg:mt-2 lg:text-xl">{recent ? getSubjectName(recent.subject) : "Start a practice session"}</h2>
        <p className="mt-1 text-sm text-muted-foreground lg:leading-6"><span className="lg:hidden">{recent ? `${recent.correct} of ${recent.total} correct last time.` : "Choose a subject and begin."}</span><span className="hidden lg:inline">{recent ? `${recent.correct} of ${recent.total} correct last time. Keep going with this subject.` : "Choose a subject and answer a short set of questions."}</span></p>
        <Link href={practiceHref} className="action-primary mt-4 w-full lg:mt-7 lg:w-auto">{recent ? "Practice this subject" : "Start practice"}</Link>
      </section>
      <section className="mt-7 lg:hidden">
        <SectionHeading title="Other ways to study" />
        <div className="divide-y">
          <Link href="/subjects" className="flex min-h-16 items-center gap-3 py-2 hover:text-primary"><BookOpen className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" /><span><span className="block text-sm font-semibold">Subjects</span><span className="mt-0.5 block text-xs text-muted-foreground">Choose a unit to study</span></span></Link>
          <Link href="/mock-test" className="flex min-h-16 items-center gap-3 py-2 hover:text-primary"><ClipboardCheck className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" /><span><span className="block text-sm font-semibold">Mock tests</span><span className="mt-0.5 block text-xs text-muted-foreground">Timed exam practice</span></span></Link>
          <button type="button" onClick={startMistakes} className="flex min-h-16 w-full items-center gap-3 py-2 text-left hover:text-primary"><RotateCcw className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" /><span><span className="block text-sm font-semibold">Review mistakes{mistakes > 0 ? ` (${mistakes})` : ""}</span><span className="mt-0.5 block text-xs text-muted-foreground">{mistakes > 0 ? "Practise questions you missed" : "Revisit questions you miss"}</span></span></button>
          <Link href="/review" className="flex min-h-16 items-center gap-3 py-2 hover:text-primary"><LayoutGrid className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" /><span><span className="block text-sm font-semibold">Question bank</span><span className="mt-0.5 block text-xs text-muted-foreground">Find answers and explanations</span></span></Link>
        </div>
      </section>
      <section className="hidden border-l pl-10 lg:block">
        <SectionHeading title="Other ways to study" />
        <div className="divide-y border-y">
          {recent && <Link href="/quiz" className="block py-4 hover:text-primary"><span className="block text-base font-semibold">Choose another practice</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">Pick a different subject or unit.</span></Link>}
          <Link href="/mock-test" className="block py-4 hover:text-primary"><span className="block text-base font-semibold">Mock test</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">Try a timed paper across your subjects.</span></Link>
          <button type="button" onClick={startMistakes} className="block w-full py-4 text-left hover:text-primary"><span className="block text-base font-semibold">Review mistakes{mistakes > 0 ? ` (${mistakes})` : ""}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{mistakes > 0 ? "Practise questions you missed before." : "Questions you miss will collect here."}</span></button>
        </div>
      </section>
    </div>
    <section className="mt-7 hidden lg:mt-9 lg:block lg:max-w-[680px]">
      <SectionHeading title="Subjects" href="/subjects" />
      <div className="divide-y border-y">{subjects.slice(0, 3).map((subject) => {
        const performance = stats?.subjectBreakdown[subject.slug];
        return <LinkRow key={subject.slug} href={`/subjects/${subject.slug}`} title={subject.name} detail={`${subject.units.length} units${performance ? ` · ${performance.total} questions attempted` : ""}`} end={performance ? <span className="text-sm font-semibold tabular-nums text-primary">{performance.accuracy}%</span> : undefined} />;
      })}</div>
    </section>
    <div className="mt-6 hidden items-center gap-5 text-sm text-muted-foreground sm:flex lg:max-w-[680px]">
      {stats && stats.quizzesTaken > 0 && <span>{stats.quizzesTaken} sessions · {stats.accuracy}% accuracy</span>}
      <Link href="/analytics" className="font-semibold text-primary">View progress</Link>
      <Link href="/history" className="font-semibold text-primary">History</Link>
    </div>
  </LearningPage>;
}
