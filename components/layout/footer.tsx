"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { useActiveProgram } from "@/lib/program";


export function Footer() {
  const pathname = usePathname();
  const { program, isChosen } = useActiveProgram();

  // Hide footer during active test sessions
  const isTakingQuiz =
    pathname.startsWith("/quiz/") &&
    pathname.split("/").length === 3 &&
    !pathname.endsWith("/results");

  if (isTakingQuiz) return null;
  const programLabel = program.level
    ? `${program.name} · ${program.level}`
    : program.name;

  return (
    <footer className="hidden border-t bg-muted/20 md:block">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Image src="/icons/icon-192.png" alt="Bujh Logo" width={192} height={192} className="h-6 w-6" />
            <span className="text-base tracking-tight">{APP_NAME}</span>
          </div>

          <p className="max-w-lg text-xs sm:text-sm text-muted-foreground leading-relaxed">
            High-yield MCQ preparation, chapter-wise practice, and timed board mock exams aligned with official CTEVT and NEB curricula in Nepal.
          </p>

          {/* Quick Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground" aria-label="Footer Navigation">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <Link href="/quiz" className="hover:text-foreground transition-colors">Practice</Link>
            <Link href="/mock-test" className="hover:text-foreground transition-colors">Mock Tests</Link>
            <Link href="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link>
            <Link href="/review" className="hover:text-foreground transition-colors">Question Bank</Link>
            <Link href="/programs" className="hover:text-foreground transition-colors">All Syllabi</Link>
          </nav>

          {/* Active Syllabus Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3.5 py-1.5 text-xs text-muted-foreground shadow-xs">
            {isChosen ? (
              <>
                <span aria-hidden>{program.icon}</span>
                <span>Active Syllabus:</span>
                <span className="font-semibold text-foreground">
                  {programLabel}
                </span>
                <Link
                  href="/programs"
                  className="font-medium text-primary hover:underline ml-0.5"
                >
                  (Change)
                </Link>
              </>
            ) : (
              <>
                <span>Curriculum not selected:</span>
                <Link
                  href="/programs"
                  className="font-semibold text-primary hover:underline"
                >
                  Choose Syllabus
                </Link>
              </>
            )}
          </div>

          {/* Copyright & Creator Attribution */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-muted-foreground border-t pt-6 w-full max-w-2xl">
            <span>© {new Date().getFullYear()} {APP_NAME}. Built for CTEVT &amp; +2 students in Nepal.</span>
            <span className="hidden sm:inline">&middot;</span>
            <span>
              Developed by{" "}
              <Link
                href="https://amanansarinp.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors underline"
              >
                Aman Ansari
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
