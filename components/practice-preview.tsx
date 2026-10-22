"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Lightbulb, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type PreviewQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export function PracticePreview({ questions }: { questions: PreviewQuestion[] }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const question = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;
  const nextQuestion = () => {
    setQuestionIndex((index) => (index + 1) % questions.length);
    setSelected(null);
  };

  if (!question) return null;

  return <div className="relative mx-auto w-full max-w-md">
    <div className="absolute -inset-5 rotate-[-5deg] rounded-[36px] bg-primary/10" />
    <div className="relative rounded-[28px] border border-primary/15 bg-card p-5 shadow-[0_24px_70px_-25px_#2448a94d] sm:p-7">
      <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-xs font-semibold text-primary"><Sparkles className="size-4" />Try a question</span><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Pharmacology</span></div>
      <div className="mt-5 flex gap-1.5" aria-label={"Question " + (questionIndex + 1) + " of " + questions.length}>{questions.map((_, index) => <span key={index} className={cn("h-1.5 flex-1 rounded-full", index === questionIndex ? "bg-primary" : index < questionIndex ? "bg-primary/45" : "bg-muted")} />)}</div>
      <h2 className="mb-5 mt-6 text-lg font-semibold leading-7 tracking-tight">{question.question}</h2>
      <div className="space-y-2">{question.options.map((option, index) => <button key={questionIndex + "-" + option} type="button" disabled={selected !== null} onClick={() => setSelected(index)} className={cn("flex min-h-12 w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors", selected !== null && index === question.correctIndex ? "border-emerald-500 bg-emerald-500/10" : selected === index ? "border-rose-400 bg-rose-500/5" : "hover:border-primary/40 hover:bg-primary/5")}><span className="flex size-7 shrink-0 items-center justify-center rounded-lg border bg-card text-xs font-semibold">{selected !== null && index === question.correctIndex ? <Check className="size-4 text-emerald-600" /> : String.fromCharCode(65 + index)}</span>{option}</button>)}</div>
      {selected === null ? <p className="mt-5 text-center text-xs text-muted-foreground">Tap an answer. Discover the why.</p> : <div className="mt-4 rounded-xl bg-primary/5 p-3 text-xs leading-5" aria-live="polite"><p className="mb-1 flex items-center gap-1.5 font-semibold text-primary"><Lightbulb className="size-3.5" />{selected === question.correctIndex ? "You’ve got it!" : "A useful thing to learn"}</p>{question.explanation}<div className="mt-3 flex flex-wrap items-center gap-3"><button type="button" onClick={() => setSelected(null)} className="flex min-h-9 items-center gap-1.5 font-semibold text-primary"><RotateCcw className="size-3" />Try again</button><button type="button" onClick={nextQuestion} className="flex min-h-9 items-center gap-1.5 font-semibold text-primary">{isLastQuestion ? "Start over" : "Next question"}<ArrowRight className="size-3.5" /></button></div></div>}
      {selected !== null && isLastQuestion && <Link href="/quiz" className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Practice for real <ArrowRight className="size-4" /></Link>}
    </div>
    <div className="relative mx-auto -mt-1 w-max rounded-b-2xl border border-t-0 bg-card px-6 py-2 text-[10px] font-semibold text-muted-foreground">A real question from the Bujh question bank</div>
  </div>;
}
