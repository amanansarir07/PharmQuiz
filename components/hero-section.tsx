"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Brain, ArrowRight, LogIn } from "lucide-react";

export function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Brain className="h-4 w-4" />
            Built for D. Pharmacy 2nd Year Students
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            {user ? (
              <>
                Welcome back, {user.name?.split(" ")[0] || "Student"}!{" "}
                <span className="text-primary">Ready to Study?</span>
              </>
            ) : (
              <>
                Master Your{" "}
                <span className="text-primary">Pharmacy Exams</span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {user
              ? "Pick up where you left off and keep your streak going."
              : "1,500+ practice questions for D. Pharmacy 2nd year. Track your progress, compete on the leaderboard, and walk into your exams confident."}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <>
                <Link
                  href="/quiz"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
                >
                  Start MCQs
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border bg-card px-6 py-3 text-base font-semibold shadow-sm hover:bg-muted transition-all"
                >
                  My Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/subjects"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
                >
                  Browse Subjects
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 rounded-xl border bg-card px-6 py-3 text-base font-semibold shadow-sm hover:bg-muted transition-all"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
