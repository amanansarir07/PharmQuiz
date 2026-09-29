"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import {
  Brain,
  ArrowRight,
  Compass,
  LogIn,
  CheckCircle,
  BookOpen,
  Trophy,
  Sparkles,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const { user } = useAuth();
  const { program, isChosen } = useActiveProgram();
  const programLabel = program.level
    ? `${program.name} ${program.level}`
    : program.name;

  const badgeLabel = isChosen
    ? `Curriculum: ${programLabel}`
    : "CTEVT & +2 Examination Platform";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background border-b">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="text-center">
          
          {/* Active / Board Pill */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3.5 py-1 text-xs font-semibold text-foreground shadow-xs backdrop-blur-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {badgeLabel}
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {user ? (
              <>
                Welcome back,{" "}
                <span className="text-primary">{user.name?.split(" ")[0] || "Student"}</span>!
              </>
            ) : (
              <>
                Master Your Board Exams with{" "}
                <span className="text-primary">Bujh</span>
              </>
            )}
          </h1>

          {/* Punchy Subheadline */}
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {user
              ? "Continue your daily streak, take targeted unit quizzes, or simulate full board exams on your personal dashboard."
              : "High-yield MCQ practice, full timed mock exams, and student leaderboard rankings for CTEVT diploma and +2 NEB streams."}
          </p>

          {/* Live Stat Chips */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/60 px-3 py-1 shadow-xs">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              800+ Verified MCQs
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/60 px-3 py-1 shadow-xs">
              <BookOpen className="h-3.5 w-3.5 text-blue-500" />
              8 Board Subjects
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/60 px-3 py-1 shadow-xs">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              Live Leaderboard
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/60 px-3 py-1 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              Detailed Explanations
            </span>
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "h-11 gap-2 px-6 text-base font-semibold shadow-md w-full sm:w-auto"
                  )}
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/quiz"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-11 px-6 text-base font-semibold w-full sm:w-auto"
                  )}
                >
                  Quick Practice Drill
                </Link>
              </>
            ) : (
              <>
                <a
                  href="#study-funnel"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "h-11 gap-2 px-6 text-base font-semibold shadow-md w-full sm:w-auto"
                  )}
                >
                  <Compass className="h-4 w-4" />
                  Choose Your Syllabus
                  <ArrowRight className="h-4 w-4" />
                </a>

                <Link
                  href="/auth/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-11 gap-2 px-6 text-base font-semibold w-full sm:w-auto"
                  )}
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
