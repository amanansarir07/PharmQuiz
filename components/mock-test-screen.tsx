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
        <div className="divide-y border-y">{exams.map((exam) => {
          const live = isExamLive(exam, now);
          return <article key={exam.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0"><p className="text-sm font-semibold">{exam.title}</p><p className="mt-1 text-xs text-muted-foreground">{formatInKathmandu(exam.starts_at)} · {exam.duration_minutes} min · {questionCount} questions</p><p className={`mt-1 text-xs font-medium ${live ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>{live ? "Live now" : `Starts in ${formatCountdown(exam.starts_at, now)}`}</p></div>
            <button type="button" disabled={!live || preparing} onClick={() => start(exam)} className="action-primary w-full shrink-0 disabled:opacity-50 sm:w-auto">{preparing ? "Preparing test…" : live ? "Start exam" : "Opens soon"}</button>
          </article>;
        })}</div>
      </section> : <section className="rounded-xl border bg-card p-5 sm:p-7">
        <h2 className="text-lg font-bold">Full syllabus mock</h2>
        <p className="mt-2 text-sm text-muted-foreground">{questionCount} questions · {durationMinutes} minutes · {subjects.length} subjects</p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">A fresh paper is generated when you begin. Answers and explanations appear after submission.</p>
        <button type="button" onClick={() => start()} disabled={preparing || questionCount === 0} className="action-primary mt-5 w-full disabled:opacity-50 sm:w-auto">{preparing ? "Preparing test…" : "Start mock test"}</button>
      </section>}
      <details className="mt-7 border-b pb-4"><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">Covered subjects</summary><p className="mb-3 text-xs text-muted-foreground">Each subject contributes 10 questions.</p><ul className="space-y-2 text-sm text-muted-foreground">{subjects.map((subject) => <li key={subject.slug}>{subject.name}</li>)}</ul></details>
      <details className="border-b py-4"><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">Exam instructions</summary><ul className="space-y-2 text-sm leading-6 text-muted-foreground"><li>The timer submits the exam when it expires.</li><li>There is no negative marking.</li><li>Answers and explanations appear after submission.</li><li>Your progress is stored locally if the page refreshes.</li></ul></details>
      <Link href="/history" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-primary">View past attempts</Link>
    </>}
  </LearningPage>;
}
