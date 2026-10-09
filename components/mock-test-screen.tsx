"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, ClipboardCheck, Clock, Play } from "lucide-react";
import { getSubjectsForProgram } from "@/data/registry";
import { useActiveProgram } from "@/lib/program";
import { useAuth } from "@/lib/auth";
import { safeSetItem } from "@/lib/storage";
import { fetchUpcomingExams, formatCountdown, formatInKathmandu, getMockDurationMinutes, getMockQuestionCount, isExamLive, scheduledMockConfig, type MockExam } from "@/lib/mock-exams";
import { LearningPage, PageHeading, SectionHeading, StatTile } from "@/components/learning-ui";

export function MockTestScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { programSlug, program } = useActiveProgram();
  const subjects = useMemo(() => getSubjectsForProgram(programSlug), [programSlug]);
  const questionCount = getMockQuestionCount(programSlug);
  const durationMinutes = getMockDurationMinutes(programSlug);
  const [exams, setExams] = useState<MockExam[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let active = true;
    const refresh = () => fetchUpcomingExams(programSlug).then((list) => { if (active) { setExams(list); setLoaded(true); } }).catch(() => { if (active) setLoaded(true); });
    void refresh();
    const refreshId = setInterval(refresh, 60_000);
    const clockId = setInterval(() => setNow(new Date()), 1000);
    return () => { active = false; clearInterval(refreshId); clearInterval(clockId); };
  }, [programSlug]);

  const start = (exam?: MockExam) => {
    const sessionId = crypto.randomUUID();
    const config = exam ? scheduledMockConfig(exam, programSlug) : { mode: "mock", program: programSlug, difficulty: "mixed", numQuestions: questionCount, timeLimit: durationMinutes, negativeMarking: false, revisionMode: false };
    safeSetItem(`quiz-config-${sessionId}`, JSON.stringify(config));
    router.push(`/quiz/${sessionId}`);
  };

  return <LearningPage className="max-w-4xl">
    <PageHeading backHref="/dashboard" eyebrow={program.shortLabel} title="Mock tests" description="Practise under exam conditions with questions across your subjects." />

    <div className="mb-7 grid grid-cols-3 gap-2"><StatTile label="Questions" value={questionCount} /><StatTile label="Minutes" value={durationMinutes} tone="amber" /><StatTile label="Subjects" value={subjects.length} tone="green" /></div>

    {exams.length > 0 ? <section className="mb-7"><SectionHeading title="Scheduled exams" description="Exam windows follow Kathmandu time." href={isAdmin ? "/admin/mock-exams" : undefined} linkLabel="Manage" />
      <div className="space-y-3">{exams.map((exam) => {
        const live = isExamLive(exam, now);
        return <article key={exam.id} className="rounded-2xl border bg-card p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${live ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>{live ? "Live now" : `Starts in ${formatCountdown(exam.starts_at, now)}`}</span><h2 className="mt-2 text-base font-bold">{exam.title}</h2><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarClock className="size-3.5" /> {formatInKathmandu(exam.starts_at)} · {exam.duration_minutes} min · {questionCount} questions</p></div><button type="button" disabled={!live} onClick={() => start(exam)} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"><Play className="size-4" /> {live ? "Start exam" : "Opens soon"}</button></div></article>;
      })}</div></section> : <section className="mb-7"><SectionHeading title="Available" /><article className="rounded-2xl border border-primary/20 bg-card p-5"><div className="flex items-start gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><ClipboardCheck className="size-6" /></span><div><h2 className="text-base font-bold">Full syllabus mock</h2><p className="mt-1 text-sm text-muted-foreground">{questionCount} questions · {durationMinutes} minutes · {subjects.length} subjects</p></div></div><p className="mt-4 text-sm leading-6 text-muted-foreground">A fresh paper is generated when you begin. Answers and explanations appear after submission.</p><button type="button" onClick={() => start()} disabled={!loaded || questionCount === 0} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"><Play className="size-4" /> {loaded ? "Start mock test" : "Checking schedule…"}</button></article></section>}

    <section><SectionHeading title="Covered subjects" description="Each subject contributes 10 questions." /><div className="grid gap-2 sm:grid-cols-2">{subjects.map((subject) => <div key={subject.slug} className="flex min-h-12 items-center gap-3 rounded-xl border bg-card px-3 text-sm"><span className="text-lg">{subject.icon}</span><span className="min-w-0 flex-1 truncate font-medium">{subject.name}</span><span className="text-xs text-muted-foreground">10</span></div>)}</div></section>
    <details className="mt-7 rounded-2xl border bg-card p-4"><summary className="cursor-pointer text-sm font-semibold">Exam instructions</summary><ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground"><li className="flex gap-2"><Clock className="mt-1 size-4 shrink-0 text-primary" /> The timer submits the exam when it expires.</li><li>There is no negative marking.</li><li>Answers and explanations appear after submission.</li><li>Your progress is stored locally if the page refreshes.</li></ul></details>
    <Link href="/history" className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline">View past attempts</Link>
  </LearningPage>;
}
