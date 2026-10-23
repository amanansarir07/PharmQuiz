"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ChartNoAxesCombined, ClipboardCheck, Flame, RotateCcw, Search, Target } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { getSubjectsForProgram, getSubjectName } from "@/data/registry";
import { calculateStats, type UserStats } from "@/lib/stats";
import { getQuizHistory, type HistoryEntry } from "@/lib/history";
import { createMistakesSession, getMistakesCount } from "@/lib/mistakes";
import { LearningPage, LinkRow, PageHeading, SectionHeading, WeeklyProgress } from "@/components/learning-ui";
import { OnboardingDepartmentModal } from "@/components/onboarding-department-modal";
import { FeatureCard, HeroCard, HomeListRow, HomeStatTile, getSubjectIcon } from "@/components/home/home-components";

export function StudentDashboard() {
  const { user } = useAuth();
  const { program, programSlug } = useActiveProgram();
  const router = useRouter();
  const subjects = useMemo(() => getSubjectsForProgram(programSlug), [programSlug]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void Promise.resolve().then(() => { if (active) setMistakes(getMistakesCount(programSlug)); });
    void calculateStats(user.id, programSlug).then((value) => { if (active) setStats(value); }).catch(console.error);
    void getQuizHistory(user.id).then((entries) => { if (active) setHistory(entries.filter((entry) => entry.program === programSlug)); }).catch((error) => { console.error("Could not load dashboard history:", error); if (active) setHistory([]); });
    return () => { active = false; };
  }, [user, programSlug]);

  const recent = history?.find((entry) => subjects.some((subject) => subject.slug === entry.subject));
  const recentSubject = recent && subjects.find((subject) => subject.slug === recent.subject);
  const practiceHref = recentSubject ? `/quiz?subject=${encodeURIComponent(recentSubject.slug)}` : "/quiz";
  const startMistakes = () => {
    const sessionId = createMistakesSession(programSlug);
    router.push(sessionId ? `/quiz/${sessionId}` : "/mistakes");
  };

  return <LearningPage className="max-w-[980px] pt-4 pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] lg:max-w-[1120px] lg:pt-5 lg:pb-12">
    <OnboardingDepartmentModal />
    <div className="space-y-6 lg:hidden">
      <Link href="/review" className="flex min-h-10 items-center gap-3 rounded-full bg-card px-4 text-sm text-muted-foreground shadow-[var(--shadow-card)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Search className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="flex-1">Find a question or topic</span>
      </Link>
      <HeroCard
        title={recent ? getSubjectName(recent.subject) : "Start your first practice"}
        description={recent ? `${recent.correct} of ${recent.total} correct last time. Keep building your confidence.` : "Choose a subject and try a short set of questions."}
        href={practiceHref}
        actionLabel={recent ? "Practice this subject" : "Start practice"}
        meta={recent ? "Continue learning" : "Your next step"}
      />
      <section className="grid grid-cols-3 gap-2.5" aria-label="Your learning progress">
        <HomeStatTile icon={<Target />} value={stats?.totalAttempted ?? "—"} label="Questions" />
        <HomeStatTile icon={<ChartNoAxesCombined />} value={stats ? `${stats.accuracy}%` : "—"} label="Accuracy" tone="success" />
        <HomeStatTile icon={<Flame />} value={stats?.currentStreak ?? "—"} label="Day streak" tone="warning" />
      </section>
      {stats && stats.totalAttempted === 0 && stats.accuracy === 0 && stats.currentStreak === 0 && (
        <p className="-mt-4 text-xs leading-5 text-muted-foreground">Answer 10 questions to start your streak</p>
      )}
      <section>
        <SectionHeading title="Your subjects" href="/subjects" linkLabel="See all" />
        <div className="space-y-2">
          {subjects.slice(0, 2).map((subject, index) => {
            const performance = stats?.subjectBreakdown[subject.slug];
            const detail = `${subject.units.length} units${performance ? ` · ${performance.total} questions` : ""}`;
            return <HomeListRow key={subject.slug} href={`/subjects/${subject.slug}`} icon={getSubjectIcon(subject.slug, subject.name)} colorIndex={index} title={subject.name} detail={detail} progress={performance?.accuracy} showProgress showChevron compact />;
          })}
        </div>
      </section>
      <section>
        <SectionHeading title="Boost your score" />
        <div className="grid grid-cols-2 gap-2.5">
          <FeatureCard href="/mistakes" icon={<RotateCcw />} title="Mistakes bank" description={mistakes > 0 ? `${mistakes} to revisit` : "Missed questions"} tone="danger" compact />
          <FeatureCard href="/mock-test" icon={<ClipboardCheck />} title="Mock tests" description="Timed exam practice" compact />
        </div>
      </section>
    </div>
    <div className="hidden lg:block">
    <header className="mb-4 lg:hidden">
      <p className="mb-1 text-xs font-semibold text-muted-foreground">{program.shortLabel} · Your study space</p>
      <h1 className="text-[1.45rem] font-bold leading-tight tracking-tight">Hello, {user?.name?.trim().split(/\s+/)[0] || "Student"}</h1>
    </header>
    <div className="hidden lg:block"><PageHeading eyebrow={program.shortLabel} title={`Hello, ${user?.name?.trim().split(/\s+/)[0] || "Student"}`} /></div>
    <Link href="/review" className="mb-4 flex min-h-11 items-center gap-3 rounded-xl border bg-card px-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:mb-5">
      <Search className="size-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="flex-1">Find a question or topic</span>
    </Link>
    {stats && stats.quizzesTaken > 0 && (
      <section aria-label="Your recent progress" className="mb-6 hidden overflow-hidden rounded-xl border bg-card sm:mb-7 lg:block">
        <div className="grid grid-cols-3 divide-x">
          <div className="px-3 py-3 sm:px-5 sm:py-4">
            <p className="text-lg font-bold tabular-nums sm:text-xl">{stats.quizzesTaken}</p>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground sm:text-xs">Sessions</p>
          </div>
          <div className="px-3 py-3 sm:px-5 sm:py-4">
            <p className="text-lg font-bold tabular-nums sm:text-xl">{stats.accuracy}%</p>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground sm:text-xs">Accuracy</p>
          </div>
          <div className="px-3 py-3 sm:px-5 sm:py-4">
            <p className="text-lg font-bold tabular-nums sm:text-xl">{stats.currentStreak}</p>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground sm:text-xs">Day streak</p>
          </div>
        </div>
      </section>
    )}
    <div className="lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start lg:gap-12">
      <section className="rounded-xl border border-primary bg-primary p-4 text-primary-foreground sm:p-6 lg:p-8">
        <p className="text-xs font-semibold text-primary-foreground/80">{recent ? "Continue learning" : "Your next step"}</p>
        <h2 className="mt-1 text-lg font-bold tracking-tight lg:mt-2 lg:text-xl">{recent ? getSubjectName(recent.subject) : "Start a practice session"}</h2>
        <p className="mt-1 text-sm leading-5 text-primary-foreground/85 lg:leading-6"><span className="lg:hidden">{recent ? `${recent.correct} of ${recent.total} correct last time.` : "Choose a subject and start a short practice."}</span><span className="hidden lg:inline">{recent ? `${recent.correct} of ${recent.total} correct last time. Keep going with this subject.` : "Choose a subject and answer a short set of questions."}</span></p>
        <Link href={practiceHref} className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-primary-foreground px-5 text-sm font-semibold text-primary transition-opacity hover:opacity-90 lg:mt-7 lg:min-h-11 lg:w-auto">{recent ? "Practice this subject" : "Start practice"}</Link>
      </section>
      <section className="mt-6 lg:hidden" aria-label="Quick study paths">
        <SectionHeading title="Quick study paths" />
        <div className="grid grid-cols-2 gap-2.5">
          <Link href="/quiz" className="flex min-h-[78px] items-center gap-2.5 rounded-xl border border-border/60 bg-card/80 p-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true"><Target className="size-[18px]" /></span>
            <span className="min-w-0"><span className="block text-sm font-bold leading-5">Practice</span><span className="mt-0.5 block text-xs leading-4 text-muted-foreground">Choose a subject</span></span>
          </Link>
          <Link href="/mock-test" className="flex min-h-[78px] items-center gap-2.5 rounded-xl border border-border/60 bg-card/80 p-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true"><ClipboardCheck className="size-[18px]" /></span>
            <span className="min-w-0"><span className="block text-sm font-bold leading-5">Mock tests</span><span className="mt-0.5 block text-xs leading-4 text-muted-foreground">Timed exam practice</span></span>
          </Link>
          <button type="button" onClick={startMistakes} className="flex min-h-[78px] items-center gap-2.5 rounded-xl border border-border/60 bg-card/80 p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true"><RotateCcw className="size-[18px]" /></span>
            <span className="min-w-0"><span className="block text-sm font-bold leading-5">Mistakes{mistakes > 0 ? ` · ${mistakes}` : ""}</span><span className="mt-0.5 block text-xs leading-4 text-muted-foreground">Review missed questions</span></span>
          </button>
          <Link href="/subjects" className="flex min-h-[78px] items-center gap-2.5 rounded-xl border border-border/60 bg-card/80 p-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true"><BookOpen className="size-[18px]" /></span>
            <span className="min-w-0"><span className="block text-sm font-bold leading-5">Subjects</span><span className="mt-0.5 block text-xs leading-4 text-muted-foreground">Browse your syllabus</span></span>
          </Link>
        </div>
      </section>
      <WeeklyProgress entries={history} className="mt-5 lg:hidden" />
      <section className="hidden border-l pl-10 lg:block">
        <SectionHeading title="Other ways to study" />
        <div className="divide-y border-y">
          {recent && <Link href="/quiz" className="block py-4 hover:text-primary"><span className="block text-base font-semibold">Choose another practice</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">Pick a different subject or unit.</span></Link>}
          <Link href="/mock-test" className="block py-4 hover:text-primary"><span className="block text-base font-semibold">Mock test</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">Try a timed paper across your subjects.</span></Link>
          <button type="button" onClick={startMistakes} className="block w-full py-4 text-left hover:text-primary"><span className="block text-base font-semibold">Review mistakes{mistakes > 0 ? ` (${mistakes})` : ""}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{mistakes > 0 ? "Practise questions you missed before." : "Questions you miss will collect here."}</span></button>
        </div>
      </section>
    </div>
    <section className="mt-7 lg:hidden">
      <SectionHeading title="Your subjects" href="/subjects" linkLabel="See all" />
      <div className="grid grid-cols-2 gap-3">
        {subjects.slice(0, 2).map((subject) => (
          <Link
            key={subject.slug}
            href={`/subjects/${subject.slug}`}
            className="flex min-h-28 flex-col justify-between rounded-2xl border bg-card p-3.5 transition-colors hover:border-primary/40 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="line-clamp-2 text-sm font-semibold leading-5">{subject.name}</span>
            <span className="mt-3">
              <span className="flex justify-between gap-2 text-xs text-muted-foreground">
                <span>{subject.units.length} units</span>
                {stats?.subjectBreakdown[subject.slug] && <span className="font-medium tabular-nums text-primary">{stats.subjectBreakdown[subject.slug].accuracy}%</span>}
              </span>
              {stats?.subjectBreakdown[subject.slug] && <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${stats.subjectBreakdown[subject.slug].accuracy}%` }} /></span>}
            </span>
          </Link>
        ))}
      </div>
    </section>
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
    </div>
  </LearningPage>;
}
