"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bookmark, ClipboardCheck, RotateCcw, Target, TrendingUp, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { getSubjectsForProgram, getSubjectName } from "@/data/registry";
import { calculateStats, type UserStats } from "@/lib/stats";
import { getQuizHistory, type HistoryEntry } from "@/lib/history";
import { createMistakesSession, getMistakesCount } from "@/lib/mistakes";
import { LearningPage, LinkRow, PageHeading, SectionHeading, SubjectIcon } from "@/components/learning-ui";
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

  const recent = history[0];
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Student";
  const recentSubject = recent && subjects.find((subject) => subject.slug === recent.subject);
  const practiceHref = recentSubject ? `/quiz?subject=${encodeURIComponent(recentSubject.slug)}` : "/quiz";
  const startMistakes = () => {
    const sessionId = createMistakesSession(programSlug);
    if (sessionId) router.push(`/quiz/${sessionId}`);
    else router.push("/mistakes");
  };

  return <LearningPage className="max-w-5xl">
    <OnboardingDepartmentModal />
    <PageHeading title={`Welcome back, ${firstName}.`} description={program.shortLabel} />

    <section className="mb-6">
      <SectionHeading title={recent ? "Continue studying" : "Start studying"} />
      <div className="rounded-xl border bg-card p-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5">
        <div className="min-w-0"><h3 className="text-base font-semibold leading-6">{recent ? getSubjectName(recent.subject) : `Start ${program.shortLabel} practice`}</h3><p className="mt-1 text-sm text-muted-foreground">{recent ? `${recent.correct} of ${recent.total} correct in your latest attempt.` : "Choose a subject and take a short MCQ session."}</p></div>
        <Link href={practiceHref} className="action-primary mt-4 w-full shrink-0 sm:mt-0 sm:w-auto">{recent ? "Continue practice" : "Start practice"}<ArrowRight className="size-4" /></Link>
      </div>
    </section>

    <section className="mb-6">
      <SectionHeading title="Practice options" />
      <div className="overflow-hidden rounded-xl border bg-card">
        <LinkRow href="/quiz" icon={<Target className="size-5" />} title="Custom practice" detail="Choose questions for your next session" />
        <LinkRow href="/mock-test" icon={<ClipboardCheck className="size-5" />} title="Mock tests" detail="Practise in exam format" />
        <button type="button" onClick={startMistakes} className="flex min-h-16 w-full items-center gap-3 border-b border-border/70 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><RotateCcw className="size-5" /></span><span className="min-w-0 flex-1 text-sm font-semibold">Review mistakes{mistakes > 0 ? ` (${mistakes})` : ""}</span><ArrowRight className="size-4 shrink-0 text-muted-foreground" /></button>
        <LinkRow href="/bookmarks" icon={<Bookmark className="size-5" />} title="Saved questions" />
      </div>
    </section>

    <section className="mb-6">
      <SectionHeading title="Your progress" href="/analytics" linkLabel="View report" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y py-4 sm:grid-cols-4">
        <DashboardMetric label="Accuracy" value={stats && stats.quizzesTaken > 0 ? `${stats.accuracy}%` : "—"} />
        <DashboardMetric label="Sessions" value={stats?.quizzesTaken ?? "—"} />
        <DashboardMetric label="Day streak" value={stats?.currentStreak ?? "—"} />
        <DashboardMetric label="Mistakes" value={mistakes} />
      </div>
    </section>

    <div className="grid gap-6 lg:grid-cols-2">
      <section className="min-w-0">
        <SectionHeading title="Your subjects" description="Pick a subject to explore units and topics." href="/subjects" />
        <div className="overflow-hidden rounded-xl border bg-card">
          {subjects.map((subject) => {
            const performance = stats?.subjectBreakdown[subject.slug];
            return <LinkRow key={subject.slug} href={`/subjects/${subject.slug}`} icon={<SubjectIcon slug={subject.slug} />} title={subject.name} detail={`${subject.units.length} units${performance ? ` · ${performance.total} questions attempted` : " · Ready to explore"}`} end={performance ? <span className="text-right"><span className="block text-sm font-bold tabular-nums text-primary">{performance.accuracy}%</span><span className="text-[10px] text-muted-foreground">accuracy</span></span> : undefined} />;
          })}
        </div>
      </section>
      <div className="min-w-0 space-y-6">
        <section>
          <SectionHeading title="Recent activity" href="/history" />
          {history.length ? <div className="overflow-hidden rounded-xl border bg-card">{history.slice(0, 3).map((entry) => <LinkRow key={entry.key} href={entry.localSessionId ? `/quiz/${entry.localSessionId}/results` : "/history"} icon={<TrendingUp className="size-5" />} title={getSubjectName(entry.subject)} detail={`${entry.correct}/${entry.total} correct · ${new Date(entry.completedAt).toLocaleDateString("en-NP", { timeZone: "Asia/Kathmandu", month: "short", day: "numeric" })}`} />)}</div> : <p className="text-sm text-muted-foreground">No recent activity yet.</p>}
        </section>
        <Link href="/leaderboard" className="flex min-h-11 items-center gap-3 border-t py-3 text-sm font-semibold hover:text-primary"><Trophy className="size-5 text-muted-foreground" /><span className="flex-1">Programme leaderboard</span><ArrowRight className="size-4 text-muted-foreground" /></Link>
      </div>
    </div>
  </LearningPage>;
}

function DashboardMetric({ label, value }: { label: string; value: string | number }) {
  return <div className="min-w-0"><p className="text-xl font-bold leading-none tabular-nums">{value}</p><p className="mt-1.5 text-xs text-muted-foreground">{label}</p></div>;
}
