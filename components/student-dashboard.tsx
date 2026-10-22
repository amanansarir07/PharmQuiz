"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Bookmark, ClipboardCheck, RotateCcw, Target, TrendingUp, Trophy, Flame, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { getSubjectsForProgram, getSubjectName } from "@/data/registry";
import { calculateStats, type UserStats } from "@/lib/stats";
import { getQuizHistory, type HistoryEntry } from "@/lib/history";
import { createMistakesSession, getMistakesCount } from "@/lib/mistakes";
import { cn } from "@/lib/utils";
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
    // Local progress is ready immediately; remote sync can finish in the background.
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

  return <LearningPage>
    <OnboardingDepartmentModal />
    <PageHeading eyebrow="Make a little progress today" title={`Welcome back, ${firstName}.`} description={`${program.shortLabel} · Your next learning step is right here.`} />
    <section className="mb-6">
      <SectionHeading title={recent ? "Continue learning" : "Start learning"} />
      <div className="dashboard-next-action">
        <span className="dashboard-next-icon"><BookOpen className="size-5" /></span>
        <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-primary">{recent ? "Latest practice" : "Your first step"}</p><h2 className="mt-1 text-lg font-bold tracking-tight sm:text-xl">{recent ? getSubjectName(recent.subject) : `Start ${program.shortLabel} practice`}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{recent ? `${recent.correct} of ${recent.total} correct in your latest attempt.` : "Choose a subject and take a short MCQ session."}</p>{recent && <div className="mt-3 h-1.5 max-w-sm overflow-hidden rounded-full bg-primary/10"><div className="h-full rounded-full bg-primary" style={{ width: (recent.total ? Math.round(recent.correct / recent.total * 100) : 0) + "%" }} /></div>}</div>
        <Link href={practiceHref} className="action-primary shrink-0 self-end sm:self-center">{recent ? "Continue" : "Start practice"}<ArrowRight className="size-4" /></Link>
      </div>
    </section>
    <section className="mb-7">
      <div className="mb-3 flex items-center justify-between"><h2 className="text-[15px] font-bold tracking-tight sm:text-base">Your progress</h2><Link href="/analytics" className="text-xs font-semibold text-primary hover:underline">View report</Link></div>
      <div className="dashboard-progress-snapshot">
        <DashboardMetric label="Accuracy" value={stats && stats.quizzesTaken > 0 ? `${stats.accuracy}%` : "—"} emphasis={Boolean(stats?.quizzesTaken)} />
        <DashboardMetric label="Sessions" value={stats?.quizzesTaken ?? "—"} emphasis={Boolean(stats?.quizzesTaken)} />
        <DashboardMetric label="Day streak" value={stats?.currentStreak ?? "—"} emphasis={Boolean(stats?.currentStreak)} />
        <DashboardMetric label="Mistakes" value={mistakes} emphasis={mistakes > 0} alert={mistakes > 0} />
      </div>
    </section>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-7">

        <section>
          <SectionHeading title="Quick actions" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Link href="/quiz" className="flex min-h-24 flex-col items-start justify-between rounded-2xl border bg-card p-3.5 hover:border-primary/40"><Target className="size-5 text-primary" /><span className="text-sm font-semibold">Custom practice</span></Link>
            <Link href="/mock-test" className="flex min-h-24 flex-col items-start justify-between rounded-2xl border bg-card p-3.5 hover:border-primary/40"><ClipboardCheck className="size-5 text-amber-600" /><span className="text-sm font-semibold">Mock tests</span></Link>
            <button type="button" onClick={startMistakes} className="flex min-h-24 flex-col items-start justify-between rounded-2xl border bg-card p-3.5 text-left hover:border-primary/40"><RotateCcw className="size-5 text-rose-600" /><span className="text-sm font-semibold">Review mistakes</span></button>
            <Link href="/bookmarks" className="flex min-h-24 flex-col items-start justify-between rounded-2xl border bg-card p-3.5 hover:border-primary/40"><Bookmark className="size-5 text-violet-600" /><span className="text-sm font-semibold">Saved questions</span></Link>
          </div>
        </section>

        <section>
          <SectionHeading title="Your subjects" description="Pick a subject to explore units and topics." href="/subjects" />
          <div className="overflow-hidden rounded-2xl border bg-card">
            {subjects.map((subject) => {
              const performance = stats?.subjectBreakdown[subject.slug];
              return <LinkRow key={subject.slug} href={`/subjects/${subject.slug}`} icon={<SubjectIcon slug={subject.slug} />} title={subject.name} detail={`${subject.units.length} units${performance ? ` Â· ${performance.total} questions attempted` : " Â· Ready to explore"}`} end={performance ? <span className="text-right"><span className="block text-sm font-bold tabular-nums text-primary">{performance.accuracy}%</span><span className="text-[10px] text-muted-foreground">accuracy</span></span> : undefined} />;
            })}
          </div>
        </section>
      </div>

      <div className="min-w-0 space-y-7">
        <section>
          <SectionHeading title="Learning milestones" />
          <div className="surface p-5"><span className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600"><Flame className="size-6" /></span><h3 className="mt-4 text-base font-bold">Small wins add up.</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Build your practice habit at your pace.</p><div className="mt-4 space-y-3">{[{ label: "Complete your first session", target: 1 }, { label: "Build up to 5 sessions", target: 5 }, { label: "Reach 20 practice sessions", target: 20 }].map((milestone) => <div key={milestone.target} className="flex items-center gap-2 text-xs"><CheckCircle2 className={`size-4 shrink-0 ${(stats?.quizzesTaken || 0) >= milestone.target ? "text-emerald-600" : "text-muted-foreground/40"}`} /><span className={(stats?.quizzesTaken || 0) >= milestone.target ? "font-medium" : "text-muted-foreground"}>{milestone.label}</span></div>)}</div></div>
        </section>
        <section>
          <SectionHeading title="Recent activity" href="/history" />
          {history.length ? <div className="overflow-hidden rounded-2xl border bg-card">{history.slice(0, 3).map((entry) => <LinkRow key={entry.key} href={entry.localSessionId ? `/quiz/${entry.localSessionId}/results` : "/history"} icon={<TrendingUp className="size-5" />} title={getSubjectName(entry.subject)} detail={`${entry.correct}/${entry.total} correct Â· ${new Date(entry.completedAt).toLocaleDateString("en-NP", { timeZone: "Asia/Kathmandu", month: "short", day: "numeric" })}`} />)}</div> : <div className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">No recent activity yet.</div>}
        </section>
        <Link href="/leaderboard" className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-sm font-semibold hover:border-primary/40"><Trophy className="size-5 text-amber-600" /><span className="flex-1">Programme leaderboard</span><ArrowRight className="size-4 text-muted-foreground" /></Link>
        {stats && stats.quizzesTaken > 0 && <Link href="/analytics" className="flex items-center gap-2 text-sm font-semibold text-primary">See your full learning report <ArrowRight className="size-4" /></Link>}
      </div>
    </div>
  </LearningPage>;
}

function DashboardMetric({ label, value, emphasis = false, alert = false }: { label: string; value: string | number; emphasis?: boolean; alert?: boolean }) {
  return <div className="min-w-0 px-3 py-3 sm:px-4"><p className={cn("text-xl font-bold leading-none tracking-tight tabular-nums sm:text-2xl", emphasis ? alert ? "text-rose-600 dark:text-rose-400" : "text-foreground" : "text-muted-foreground")}>{value}</p><p className="mt-1.5 text-[11px] font-medium text-muted-foreground">{label}</p></div>;
}

