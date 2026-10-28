"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSubjectsForProgram } from "@/data/registry";
import { useActiveProgram } from "@/lib/program";
import { useAuth } from "@/lib/auth";
import { safeSetItem } from "@/lib/storage";
import { fetchUpcomingExams, formatCountdown, formatInKathmandu, getMockDurationMinutes, getMockQuestionCount, isExamLive, scheduledMockConfig, type MockExam } from "@/lib/mock-exams";
import { AppLoading } from "@/components/app-state";
import { LearningPage, PageHeading, SectionHeading } from "@/components/learning-ui";

export function MockTestScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { programSlug, program } = useActiveProgram();
  const subjects = useMemo(() => getSubjectsForProgram(programSlug), [programSlug]);
  const questionCount = getMockQuestionCount(programSlug);
  const durationMinutes = getMockDurationMinutes(programSlug);
  const [exams, setExams] = useState<MockExam[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [preparing, setPreparing] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let active = true;
    const refresh = () => fetchUpcomingExams(programSlug).then((list) => {
      if (active) { setExams(list); setLoaded(true); setLoadError(false); }
    }).catch(() => { if (active) { setExams([]); setLoaded(true); setLoadError(true); } });
    void refresh();
    const refreshId = setInterval(refresh, 60_000);
    const clockId = setInterval(() => setNow(new Date()), 1000);
    return () => { active = false; clearInterval(refreshId); clearInterval(clockId); };
  }, [programSlug, retryKey]);

  const start = (exam?: MockExam) => {
    if (preparing) return;
    setPreparing(true);
    const sessionId = crypto.randomUUID();
    const config = exam ? scheduledMockConfig(exam, programSlug) : { mode: "mock", program: programSlug, difficulty: "mixed", numQuestions: questionCount, timeLimit: durationMinutes, negativeMarking: false, revisionMode: false };
    safeSetItem(`quiz-config-${sessionId}`, JSON.stringify(config));
    router.push(`/quiz/${sessionId}`);
  };

  return <LearningPage>
    <PageHeading backHref="/dashboard" eyebrow={program.shortLabel} title="Mock tests" description="A timed paper covering your programme." />
    {!loaded ? <AppLoading label="Checking available tests" variant="page" /> : <>
      {loadError && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b pb-4 text-sm"><p>Could not check the exam schedule. You can still start a full syllabus mock.</p><button type="button" className="font-semibold text-primary" onClick={() => { setLoaded(false); setLoadError(false); setRetryKey((key) => key + 1); }}>Retry schedule</button></div>}
      {exams.length > 0 ? <section>
        <SectionHeading title="Scheduled exams" description="Times shown in Kathmandu time." href={isAdmin ? "/admin/mock-exams" : undefined} linkLabel="Manage" />
        <div className="divide-y rounded-xl border bg-card px-4 sm:px-6">{exams.map((exam) => {
          const live = isExamLive(exam, now);
          return <article key={exam.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0"><p className="text-base font-semibold">{exam.title}</p><p className="mt-1 text-xs text-muted-foreground">{formatInKathmandu(exam.starts_at)} · {exam.duration_minutes} min · {questionCount} questions</p><p className={`mt-1 text-xs font-medium ${live ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>{live ? "Live now" : `Starts in ${formatCountdown(exam.starts_at, now)}`}</p></div>
            <button type="button" disabled={!live || preparing} onClick={() => start(exam)} className="action-primary w-full shrink-0 disabled:opacity-50 sm:w-auto">{preparing ? "Preparing test…" : live ? "Start exam" : "Opens soon"}</button>
          </article>;
        })}</div>
      </section> : <section className="overflow-hidden rounded-xl border border-primary bg-primary text-primary-foreground">
        <div className="p-5 sm:p-7">
          <p className="text-xs font-semibold text-primary-foreground/75">{program.shortLabel} · Exam simulation</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Full syllabus mock</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-primary-foreground/85">A timed paper across your programme. Review your answers and explanations as soon as you submit.</p>
          <div className="mt-5 grid grid-cols-3 divide-x divide-primary-foreground/20 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10">
            <div className="px-3 py-3 sm:px-4"><p className="text-lg font-bold tabular-nums">{questionCount}</p><p className="text-[11px] text-primary-foreground/75 sm:text-xs">Questions</p></div>
            <div className="px-3 py-3 sm:px-4"><p className="text-lg font-bold tabular-nums">{durationMinutes}</p><p className="text-[11px] text-primary-foreground/75 sm:text-xs">Minutes</p></div>
            <div className="px-3 py-3 sm:px-4"><p className="text-lg font-bold tabular-nums">{subjects.length}</p><p className="text-[11px] text-primary-foreground/75 sm:text-xs">Subjects</p></div>
          </div>
          <button type="button" onClick={() => start()} disabled={preparing || questionCount === 0} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary-foreground px-5 text-sm font-semibold text-primary transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto">{preparing ? "Preparing test…" : "Start mock test"}</button>
        </div>
      </section>}
      <details className="mt-7 border-b pb-4"><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">Covered subjects</summary><p className="mb-3 text-xs text-muted-foreground">Each subject contributes 10 questions.</p><ul className="space-y-2 text-sm text-muted-foreground">{subjects.map((subject) => <li key={subject.slug}>{subject.name}</li>)}</ul></details>
      <details className="border-b py-4"><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">Exam instructions</summary><ul className="space-y-2 text-sm leading-6 text-muted-foreground"><li>The timer submits the exam when it expires.</li><li>There is no negative marking.</li><li>Answers and explanations appear after submission.</li><li>Your progress is stored locally if the page refreshes.</li></ul></details>
      <Link href="/history" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-primary">View past attempts</Link>
    </>}
  </LearningPage>;
}
