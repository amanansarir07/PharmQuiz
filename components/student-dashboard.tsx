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
import { LearningPage, LinkRow, PageHeading, SectionHeading, StatTile, SubjectIcon } from "@/components/learning-ui";
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
    <PageHeading eyebrow="Make a little progress today" title={`Welcome back, ${firstName}.`} description={`${program.shortLabel} · Your next learning step is right here.`} action={<Link href="/quiz" className="action-primary"><Target className="size-4" />Start practice</Link>} />
    <div className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4"><StatTile label="Overall accuracy" value={stats && stats.quizzesTaken > 0 ? `${stats.accuracy}%` : "—"} detail="Across your completed practice" /><StatTile label="Practice sessions" value={stats?.quizzesTaken ?? "—"} tone="green" detail="Every session is a step forward" /><StatTile label="Current day streak" value={stats?.currentStreak ?? "—"} tone="amber" detail="Build a habit, one day at a time" /><StatTile label="Mistakes to revisit" value={mistakes} tone="red" detail="Turn these into your strengths" /></div>

    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-7">
        <section>
          <SectionHeading title="Continue learning" />
          <div className="relative overflow-hidden rounded-[24px] bg-[#294bc9] text-white shadow-[0_12px_32px_-16px_#294bc980]">
            <div className="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full border-[35px] border-white/5" />
            <div className="relative flex items-start gap-4 p-5 sm:p-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white"><BookOpen className="size-6" /></span>
              <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-blue-100">{recent ? "Keep the momentum" : "Your first step"}</p><h2 className="mt-2 text-xl font-bold tracking-tight">{recent ? getSubjectName(recent.subject) : `Start ${program.shortLabel} practice`}</h2><p className="mt-2 text-sm leading-6 text-blue-100">{recent ? `${recent.correct} of ${recent.total} correct in your latest attempt. Ready to build on that?` : "Choose a subject and take a short MCQ session. Every answer is a chance to understand more."}</p></div>
            </div>
            {recent && <div className="mx-6 mb-5 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#b6f4df]" style={{ width: `${recent.total ? Math.round(recent.correct / recent.total * 100) : 0}%` }} /></div>}
            <div className="px-5 pb-5 sm:px-6 sm:pb-6"><Link href={practiceHref} className="inline-flex min-h-11 items-center justify-center gap-3 rounded-xl bg-white px-5 text-sm font-bold text-[#2445c5]">{recent ? "Practise this subject" : "Start practice"}<ArrowRight className="size-4" /></Link></div>
          </div>
        </section>

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
              return <LinkRow key={subject.slug} href={`/subjects/${subject.slug}`} icon={<SubjectIcon slug={subject.slug} />} title={subject.name} detail={`${subject.units.length} units${performance ? ` · ${performance.total} questions attempted` : " · Ready to explore"}`} end={performance ? <span className="text-right"><span className="block text-sm font-bold tabular-nums text-primary">{performance.accuracy}%</span><span className="text-[10px] text-muted-foreground">accuracy</span></span> : undefined} />;
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
          {history.length ? <div className="overflow-hidden rounded-2xl border bg-card">{history.slice(0, 3).map((entry) => <LinkRow key={entry.key} href={entry.localSessionId ? `/quiz/${entry.localSessionId}/results` : "/history"} icon={<TrendingUp className="size-5" />} title={getSubjectName(entry.subject)} detail={`${entry.correct}/${entry.total} correct · ${new Date(entry.completedAt).toLocaleDateString("en-NP", { timeZone: "Asia/Kathmandu", month: "short", day: "numeric" })}`} />)}</div> : <div className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">No recent activity yet.</div>}
        </section>
        <Link href="/leaderboard" className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-sm font-semibold hover:border-primary/40"><Trophy className="size-5 text-amber-600" /><span className="flex-1">Programme leaderboard</span><ArrowRight className="size-4 text-muted-foreground" /></Link>
        {stats && stats.quizzesTaken > 0 && <Link href="/analytics" className="flex items-center gap-2 text-sm font-semibold text-primary">See your full learning report <ArrowRight className="size-4" /></Link>}
      </div>
    </div>
  </LearningPage>;
}
