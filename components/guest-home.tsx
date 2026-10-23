"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ChartNoAxesCombined, ClipboardCheck, Flame, LayoutGrid, RotateCcw, Search, Target } from "lucide-react";
import { useActiveProgram } from "@/lib/program";
import { getSubjectsForProgram, getSubjectName } from "@/data/registry";
import { getQuizHistory, type HistoryEntry } from "@/lib/history";
import { LearningPage, LinkRow, PageHeading, SectionHeading, WeeklyProgress } from "@/components/learning-ui";
import { calculateStats, type UserStats } from "@/lib/stats";
import { FeatureCard, HeroCard, HomeListRow, HomeStatTile, getSubjectIcon } from "@/components/home/home-components";

export function GuestHome() {
  const { program } = useActiveProgram();
  const subjects = useMemo(() => getSubjectsForProgram(program.slug), [program.slug]);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const recent = history?.find((entry) =>
    entry.program === program.slug &&
    entry.localSessionId &&
    subjects.some((subject) => subject.slug === entry.subject)
  ) ?? null;

  useEffect(() => {
    let active = true;
    void getQuizHistory().then((history) => {
      if (!active) return;
      setHistory(history.filter((entry) => entry.program === program.slug));
    }).catch((error) => {
      console.error("Could not load guest dashboard history:", error);
      if (active) setHistory([]);
    });
    void calculateStats(undefined, program.slug).then((value) => {
      if (active) setStats(value);
    }).catch((error) => {
      console.error("Could not load guest dashboard stats:", error);
    });
    return () => { active = false; };
  }, [program.slug, subjects]);

  return <LearningPage className="max-w-[980px] pt-4 pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] lg:max-w-[1120px] lg:pt-5 lg:pb-12">
    <div className="space-y-6 lg:hidden">
      <Link href="/review" className="flex min-h-10 items-center gap-3 rounded-full bg-card px-4 text-sm text-muted-foreground shadow-[var(--shadow-card)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Search className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="flex-1">Find a question or topic</span>
      </Link>
      <HeroCard
        title={recent ? getSubjectName(recent.subject) : "Start your first practice"}
        description={recent ? `${recent.correct} of ${recent.total} correct last time. Keep building your confidence.` : "Choose a subject and try a short set of questions."}
        href={recent ? `/quiz?subject=${encodeURIComponent(recent.subject)}` : "/quiz"}
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
            const subjectResults = history?.filter((entry) => entry.subject === subject.slug) ?? [];
            const attempted = subjectResults.reduce((total, entry) => total + entry.total, 0);
            const correct = subjectResults.reduce((total, entry) => total + entry.correct, 0);
            const accuracy = attempted ? Math.round((correct / attempted) * 100) : undefined;
            return <HomeListRow key={subject.slug} href={`/subjects/${subject.slug}`} icon={getSubjectIcon(subject.slug, subject.name)} colorIndex={index} title={subject.name} detail={`${subject.units.length} units${attempted ? ` · ${attempted} questions` : ""}`} progress={accuracy} showProgress showChevron compact />;
          })}
        </div>
      </section>
      <section>
        <SectionHeading title="Boost your score" />
        <div className="grid grid-cols-2 gap-2.5">
          <FeatureCard href="/mistakes" icon={<RotateCcw />} title="Mistakes bank" description="Missed questions" tone="danger" compact />
          <FeatureCard href="/mock-test" icon={<ClipboardCheck />} title="Mock tests" description="Timed exam practice" compact />
        </div>
      </section>
    </div>
    <div className="hidden lg:block">
    <header className="mb-4 lg:hidden">
      <p className="mb-1 text-xs font-semibold text-muted-foreground">{program.shortLabel} · Study home</p>
      <h1 className="text-[1.45rem] font-bold leading-tight tracking-tight">What would you like to study?</h1>
    </header>
    <div className="hidden lg:block">
      <PageHeading eyebrow={program.shortLabel} title="Your study space" description="Pick up a recent session or choose what to practise next." />
    </div>

    <div className="lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start lg:gap-10">
      <div className="space-y-5 lg:space-y-6">
        <Link href="/review" className="flex min-h-11 items-center gap-3 rounded-xl border bg-card px-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden">
          <Search className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="flex-1">Find a question or topic</span>
        </Link>

        <section className="overflow-hidden rounded-xl border border-primary bg-primary text-primary-foreground" aria-labelledby="practice-title">
          <div className="p-4 sm:p-6">
            <p className="text-xs font-semibold text-primary-foreground/80">{recent ? "Pick up where you left off" : "A good place to start"}</p>
            <h2 id="practice-title" className="mt-1 text-lg font-bold tracking-tight sm:text-xl">
              {recent ? getSubjectName(recent.subject) : "Practise what you’re learning"}
            </h2>
            <p className="mt-1 max-w-lg text-sm leading-5 text-primary-foreground/85">
              {recent
                ? `${recent.correct} of ${recent.total} correct last time. Keep strengthening this subject.`
                : "Choose a subject or unit and start a short practice."}
            </p>
            <div className="mt-3 flex flex-col gap-2.5 sm:mt-4 sm:flex-row sm:items-center sm:gap-3">
              <Link
                href={recent ? `/quiz?subject=${encodeURIComponent(recent.subject)}` : "/quiz"}
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary-foreground px-5 text-sm font-semibold text-primary transition-opacity hover:opacity-90 sm:min-h-11 sm:w-auto"
              >
                {recent ? "Practise this subject" : "Start practice"}
              </Link>
              <span className="text-xs text-primary-foreground/80">Up to 10 questions · Your pace</span>
            </div>
            {recent?.localSessionId && (
              <Link href={`/quiz/${recent.localSessionId}/results`} className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-primary-foreground/90 hover:text-primary-foreground lg:hidden">
                Review your last result
              </Link>
            )}
          </div>
        </section>

        <section className="lg:hidden" aria-label="Quick study paths">
          <SectionHeading title="Quick study paths" />
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { title: "Practice", detail: "Short MCQ session", href: "/quiz", icon: Target },
              { title: "Subjects", detail: "Explore your syllabus", href: "/subjects", icon: BookOpen },
              { title: "Mock tests", detail: "Timed exam practice", href: "/mock-test", icon: ClipboardCheck },
              { title: "Question bank", detail: "Review explanations", href: "/review", icon: LayoutGrid },
            ].map(({ title, detail, href, icon: Icon }) => (
              <Link key={title} href={href} className="flex min-h-[78px] items-center gap-2.5 rounded-xl border border-border/60 bg-card/80 p-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true"><Icon className="size-[18px]" /></span>
                <span className="min-w-0"><span className="block text-sm font-bold leading-5">{title}</span><span className="mt-0.5 block text-xs leading-4 text-muted-foreground">{detail}</span></span>
              </Link>
            ))}
          </div>
        </section>

        <WeeklyProgress entries={history} className="lg:hidden" />

        <section>
          <SectionHeading title="Your subjects" description={`${subjects.length} subjects in ${program.shortLabel}`} href="/subjects" linkLabel="See all" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
            {subjects.slice(0, 4).map((subject) => {
              const subjectResults = history?.filter((entry) => entry.subject === subject.slug) ?? [];
              const attempted = subjectResults.reduce((total, entry) => total + entry.total, 0);
              const correct = subjectResults.reduce((total, entry) => total + entry.correct, 0);
              const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
              return <Link
                key={subject.slug}
                href={`/subjects/${subject.slug}`}
                className="group flex min-h-28 flex-col justify-between rounded-2xl border bg-card p-3.5 transition-colors hover:border-primary/40 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-32 sm:p-4"
              >
                <span className="line-clamp-2 text-sm font-semibold leading-5">{subject.name}</span>
                <span className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{subject.units.length} units · {subject.examMarks} marks</span>
                </span>
                {attempted > 0 && <span className="mt-2">
                  <span className="flex justify-between text-[10px] text-muted-foreground"><span>{attempted} questions</span><span>{accuracy}%</span></span>
                  <span className="mt-1 block h-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${accuracy}%` }} /></span>
                </span>}
              </Link>;
            })}
          </div>
        </section>
      </div>

      <div className="mt-6 space-y-6 lg:mt-0">
        {recent?.localSessionId && (
          <section className="hidden lg:block">
            <SectionHeading title="Recent practice" />
            <Link
              href={`/quiz/${recent.localSessionId}/results`}
              className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="text-sm font-semibold">{getSubjectName(recent.subject)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {recent.correct} of {recent.total} correct
                {recent.completedAt ? ` · ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "Asia/Kathmandu" }).format(new Date(recent.completedAt))}` : ""}
              </p>
              <span className="mt-3 inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-primary">
                Review answers <RotateCcw className="size-3.5" aria-hidden="true" />
              </span>
            </Link>
          </section>
        )}

        <section className="hidden lg:block">
          <SectionHeading title="Study tools" />
          <div className="divide-y border-y">
            <LinkRow
              href="/mock-test"
              icon={<ClipboardCheck className="size-[18px]" aria-hidden="true" />}
              title="Mock tests"
              detail="Timed exam practice"
            />
            <LinkRow
              href="/review"
              icon={<LayoutGrid className="size-[18px]" aria-hidden="true" />}
              title="Question bank"
              detail="Browse questions and explanations"
            />
          </div>
        </section>
        <section className="hidden rounded-xl border bg-card p-4 lg:block">
          <p className="text-sm font-semibold">Studying as a guest</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Your practice stays on this device. Create an account when you’re ready to sync progress across devices.</p>
          <Link href={`/auth/register?program=${encodeURIComponent(program.slug)}`} className="mt-3 inline-flex min-h-10 items-center text-xs font-semibold text-primary hover:underline">
            Create a free account
          </Link>
        </section>
      </div>
    </div>

    <div className="mt-6 border-t pt-4 text-xs text-muted-foreground lg:hidden">
      Guest mode · Practice is saved on this device.{" "}
      <Link href={`/auth/register?program=${encodeURIComponent(program.slug)}`} className="font-semibold text-primary hover:underline">Create an account to sync</Link>
    </div>
    </div>
  </LearningPage>;
}
