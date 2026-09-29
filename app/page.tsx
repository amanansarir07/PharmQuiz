import Link from "next/link";
import { HeroSection } from "@/components/hero-section";
import { StudyFunnel } from "@/components/study-funnel";
import { ProgramHome } from "@/components/program-home";
import {
  Brain,
  Timer,
  Trophy,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { getProgrammeQuestionCounts } from "@/lib/quiz-loader";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const questionCounts = await getProgrammeQuestionCounts();

  return (
    <div className="flex flex-col">
      {/* 1. App Hero */}
      <HeroSection />

      {/* 2. Interactive 'What do you study?' Stepper Funnel */}
      <StudyFunnel id="study-funnel" />

      {/* 3. Active Programme Syllabus & Stats */}
      <ProgramHome questionCounts={questionCounts} />

      {/* 4. App Value Pillars (Compact, Zero Fluff) */}
      <section className="border-t bg-muted/20 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Engineered for Exam Day Confidence
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Built specifically around official CTEVT & NEB syllabi.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border bg-card p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Chapter & Unit MCQs</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Filter by specific units, select difficulty, and get instant explanations for every answer option.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border bg-card p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                <Timer className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Full Board Mock Exams</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Real exam conditions: 80 questions across all 8 subjects in 80 minutes to build real test stamina.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border bg-card p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Peer Leaderboards</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Compete with fellow students in your curriculum with daily, weekly, and all-time ranking boards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Minimal Quick-Start Banner */}
      <section className="border-t bg-card py-10">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Start Free Practice Today
          </div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Choose Your Syllabus & Begin
          </h2>
          <div className="mt-5 flex justify-center">
            <a
              href="#study-funnel"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "gap-2 px-6 font-semibold shadow-sm"
              )}
            >
              Select Your Curriculum
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
