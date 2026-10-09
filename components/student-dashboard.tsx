"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Bookmark, ClipboardCheck, RotateCcw, Target, TrendingUp, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { getSubjectsForProgram, getSubjectName } from "@/data/registry";
import { calculateStats, type UserStats } from "@/lib/stats";
import { getQuizHistory, type HistoryEntry } from "@/lib/history";
import { createMistakesSession, getMistakesCount } from "@/lib/mistakes";
import { LearningPage, LinkRow, PageHeading, SectionHeading, StatTile } from "@/components/learning-ui";
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
    <PageHeading eyebrow={program.shortLabel} title={`Welcome back, ${firstName}`} description="Keep learning. Small steps make progress." action={<Link href="/programs" className="text-xs font-semibold text-primary hover:underline">Switch programme</Link>} />

    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-7">
        <section>
          <SectionHeading title="Continue learning" />
          <div className="overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-sm">
            <div className="flex items-start gap-4 p-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookOpen className="size-6" /></span>
              <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wide text-primary">{recent ? "Recent practice" : "Your first step"}</p><h2 className="mt-1 truncate text-lg font-bold">{recent ? getSubjectName(recent.subject) : `Start ${program.shortLabel} practice`}</h2><p className="mt-1 text-sm text-muted-foreground">{recent ? `${recent.correct} of ${recent.total} correct in your latest attempt` : "Choose a subject and take a short MCQ session."}</p></div>
            </div>
            {recent && <div className="mx-5 mb-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${recent.total ? Math.round(recent.correct / recent.total * 100) : 0}%` }} /></div>}
            <Link href={practiceHref} className="flex min-h-11 items-center justify-center gap-2 bg-primary px-4 text-sm font-semibold text-primary-foreground">{recent ? "Practice this subject again" : "Start practice"}<ArrowRight className="size-4" /></Link>
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
              return <LinkRow key={subject.slug} href={`/subjects/${subject.slug}`} icon={<span className="text-xl">{subject.icon}</span>} title={subject.name} detail={`${subject.units.length} units${performance ? ` · ${performance.total} questions attempted` : ""}`} end={performance ? <span className="text-sm font-bold tabular-nums text-primary">{performance.accuracy}%</span> : undefined} />;
            })}
          </div>
        </section>
      </div>

      <div className="min-w-0 space-y-7">
        <section>
          <SectionHeading title="Your progress" href="/analytics" />
          {stats && stats.quizzesTaken > 0 ? <div className="grid grid-cols-2 gap-2"><StatTile label="Accuracy" value={`${stats.accuracy}%`} /><StatTile label="Quizzes" value={stats.quizzesTaken} tone="green" /><StatTile label="Day streak" value={stats.currentStreak} tone="amber" /><StatTile label="Mistakes to revisit" value={mistakes} tone="red" /></div> : <div className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">Your progress will appear after your first quiz.</div>}
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
