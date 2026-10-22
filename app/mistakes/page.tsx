"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useActiveProgram } from "@/lib/program";
import { getMistakeQuestions, createMistakesSession } from "@/lib/mistakes";
import { getSubjectName } from "@/data/registry";
import { getSubjectForUnit, getUnitName } from "@/lib/quiz-helpers";
import type { QuizQuestion } from "@/lib/quiz-loader";
import { AppEmpty } from "@/components/app-state";
import { LibraryNav } from "@/components/library-nav";
import { LearningPage, PageHeading } from "@/components/learning-ui";

export default function MistakesPage() {
  const { programSlug } = useActiveProgram();
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  useEffect(() => { const frame = requestAnimationFrame(() => setQuestions(getMistakeQuestions(programSlug))); return () => cancelAnimationFrame(frame); }, [programSlug]);
  const startPractice = () => { const sessionId = createMistakesSession(programSlug); if (sessionId) router.push(`/quiz/${sessionId}`); };

  return <LearningPage className="max-w-[1200px]">
    <PageHeading eyebrow="Targeted revision" title="Mistakes Bank" description="Revisit questions you answered incorrectly on this device." action={questions.length > 0 && <button type="button" onClick={startPractice} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"><RotateCcw className="size-4" /> Practice mistakes</button>} />
      <LibraryNav />
    {questions.length > 0 && <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400"><RotateCcw className="size-5" /></span><div><p className="text-sm font-bold">{questions.length} questions. Another chance to understand.</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Retry these together, then review the explanations in your results.</p></div></div>}
    {questions.length === 0 ? <AppEmpty title="No mistakes to review" description="When you miss a practice question, it will appear here for focused revision." action="Start practice" onAction={() => router.push("/quiz")} /> : <div className="space-y-2.5">{questions.map((question, index) => <article key={`${question.id}-${index}`} className="rounded-2xl border bg-card p-4 sm:p-5"><div className="mb-2 flex flex-wrap gap-2 text-[11px] font-semibold"><span className="rounded-full bg-primary/10 px-2 py-1 text-primary">{getSubjectName(question.subjectSlug || getSubjectForUnit(question.unitId) || "")}</span>{question.unitId && <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">{getUnitName(question.unitId)}</span>}<span className="rounded-full bg-amber-500/10 px-2 py-1 capitalize text-amber-700 dark:text-amber-400">{question.difficulty}</span></div><h2 className="text-sm font-semibold leading-6">{question.question}</h2><p className="mt-2 text-xs text-muted-foreground">Review this question in a focused mistakes session.</p></article>)}</div>}
  </LearningPage>;
}
