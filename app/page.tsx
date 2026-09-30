import { MainScreenSelector } from "@/components/main-screen-selector";
import { Brain, Timer, Trophy } from "lucide-react";
import { getProgrammeQuestionCounts } from "@/lib/quiz-loader";

export default async function HomePage() {
  const questionCounts = await getProgrammeQuestionCounts();

  return (
    <div className="flex flex-col">
      {/* 1. Main Screen Course Selector (Top of page, zero swipe required) */}
      <MainScreenSelector questionCounts={questionCounts} />

      {/* 2. Compact Value Pillars (Zero Fluff, Fast 60fps Rendering) */}
      <section className="bg-muted/10 py-10 sm:py-14 border-t">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Engineered for Exam Day Confidence
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Built specifically around official CTEVT &amp; NEB Board syllabi in Nepal.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border bg-card p-5 shadow-xs transition-all hover:border-primary/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base">Chapter &amp; Unit MCQs</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Filter by specific units, select difficulty, and get instant explanations for every question.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border bg-card p-5 shadow-xs transition-all hover:border-primary/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
                <Timer className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base">Full Board Mock Exams</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Real exam conditions: timed mock tests across all subjects to build genuine exam stamina.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border bg-card p-5 shadow-xs transition-all hover:border-primary/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-3">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base">Live Peer Leaderboards</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Compete with fellow students across Nepal with daily, weekly, and curriculum rankings.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
