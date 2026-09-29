"use client";

import { supabase } from "@/lib/supabase/client";
import { resolveResultProgram } from "@/lib/result-program";

export interface UserStats {
  quizzesTaken: number;
  totalCorrect: number;
  totalAttempted: number;
  accuracy: number;
  currentStreak: number;
  totalScore: number;
  subjectBreakdown: Record<string, { correct: number; total: number; accuracy: number }>;
}

interface ResultRow {
  subject: string;
  correct: number;
  total: number;
  completed_at: string;
  program?: string | null;
}

/**
 * Load the caller's results, optionally limited to one programme.
 *
 * The programme filter is applied in SQL when migration 008 has been run. On
 * a deployment that hasn't run it yet the `program` column doesn't exist, so
 * the query fails — we then retry unfiltered and filter in JS by resolving
 * each row's programme from its subject. Either way the caller sees the same
 * thing, and stats silently stop leaking across programmes the moment the
 * migration lands.
 */
async function fetchResults(
  userId: string,
  programSlug?: string
): Promise<ResultRow[] | null> {
  const base = () =>
    supabase
      .from("quiz_results")
      .select("subject, correct, total, completed_at, program")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

  try {
    if (programSlug) {
      const filtered = await supabase
        .from("quiz_results")
        .select("subject, correct, total, completed_at, program")
        .eq("user_id", userId)
        .eq("program", programSlug)
        .order("completed_at", { ascending: false });
      if (!filtered.error) return (filtered.data || []) as ResultRow[];
    }

    const plain = await supabase
      .from("quiz_results")
      .select("subject, correct, total, completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (!plain.error && plain.data) {
      const rows = plain.data as ResultRow[];
      return programSlug
        ? rows.filter(
            (r) => resolveResultProgram(null, r.subject) === programSlug
          )
        : rows;
    }

    // Last resort: the programme-aware shape, unfiltered.
    const withProgram = await base();
    if (withProgram.error || !withProgram.data) return null;
    const rows = withProgram.data as ResultRow[];
    return programSlug
      ? rows.filter(
          (r) =>
            resolveResultProgram(r.program, r.subject) === programSlug
        )
      : rows;
  } catch {
    return null;
  }
}

/**
 * Totals for one student. `programSlug` restricts the numbers to a single
 * programme; omit it to count every programme they have practised in.
 */
export async function calculateStats(
  userId?: string,
  programSlug?: string
): Promise<UserStats> {
  if (!userId) {
    return getLocalStats(programSlug);
  }

  try {
    const results = await fetchResults(userId, programSlug);

    if (!results || results.length === 0) {
      // Fallback to localStorage
      return getLocalStats(programSlug);
    }

    let totalCorrect = 0;
    let totalAttempted = 0;
    const subjectBreakdown: Record<string, { correct: number; total: number; accuracy: number }> = {};

    for (const r of results) {
      totalCorrect += r.correct;
      totalAttempted += r.total;

      if (!subjectBreakdown[r.subject]) {
        subjectBreakdown[r.subject] = { correct: 0, total: 0, accuracy: 0 };
      }
      subjectBreakdown[r.subject].correct += r.correct;
      subjectBreakdown[r.subject].total += r.total;
    }

    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

    for (const subject of Object.values(subjectBreakdown)) {
      subject.accuracy = subject.total > 0 ? Math.round((subject.correct / subject.total) * 100) : 0;
    }

    const totalScore = totalCorrect;
    const currentStreak = calculateStreakFromResults(results);

    return {
      quizzesTaken: results.length,
      totalCorrect,
      totalAttempted,
      accuracy,
      currentStreak,
      totalScore,
      subjectBreakdown,
    };
  } catch (err) {
    console.error("Error fetching stats from Supabase:", err);
    return getLocalStats();
  }
}

/**
 * Build stats from localStorage quiz results (fallback when Supabase is unavailable).
 * Reads quiz-results-* keys written by the quiz page. Pass `programSlug` to
 * count only the active programme's practice.
 */
function getLocalStats(programSlug?: string): UserStats {
  if (typeof window === "undefined") {
    return emptyStats();
  }

  try {
    const allResults: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("quiz-results-")) {
        try {
          const raw = JSON.parse(localStorage.getItem(key) || "{}");
          if (raw && raw.answers && raw.questions) {
            allResults.push(raw);
          }
        } catch {
          // skip corrupt entries
        }
      }
    }

    // Older results predate the programme field, so resolve from the subject
    // rather than dropping them — otherwise a student's history would appear
    // to vanish the first time they look at a programme-scoped dashboard.
    const scoped = programSlug
      ? allResults.filter(
          (r) =>
            resolveResultProgram(r.config?.program, r.config?.subject || "") ===
            programSlug
        )
      : allResults;
    allResults.length = 0;
    allResults.push(...scoped);

    if (allResults.length === 0) return emptyStats();

    // Sort by completedAt ascending for streak calculation
    allResults.sort((a, b) => {
      const ta = a.config?.completedAt || "";
      const tb = b.config?.completedAt || "";
      return ta.localeCompare(tb);
    });

    let totalCorrect = 0;
    let totalAttempted = 0;
    const subjectBreakdown: Record<string, { correct: number; total: number; accuracy: number }> = {};

    for (const result of allResults) {
      const correct = result.answers.filter((a: any) => a.isCorrect).length;
      const total = result.questions.length;
      const subject = result.config?.subject || "unknown";

      totalCorrect += correct;
      totalAttempted += total;

      if (!subjectBreakdown[subject]) {
        subjectBreakdown[subject] = { correct: 0, total: 0, accuracy: 0 };
      }
      subjectBreakdown[subject].correct += correct;
      subjectBreakdown[subject].total += total;
    }

    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

    for (const subject of Object.values(subjectBreakdown)) {
      subject.accuracy = subject.total > 0 ? Math.round((subject.correct / subject.total) * 100) : 0;
    }

    // Calculate streak from dates
    const dates = allResults
      .map((r) => r.config?.completedAt?.split("T")[0])
      .filter(Boolean);
    const uniqueDates = [...new Set(dates)].sort().reverse();
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    let currentStreak = 0;
    if (uniqueDates.length > 0 && (uniqueDates[0] === today || uniqueDates[0] === yesterday)) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const curr = new Date(uniqueDates[i - 1]);
        const prev = new Date(uniqueDates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      quizzesTaken: allResults.length,
      totalCorrect,
      totalAttempted,
      accuracy,
      currentStreak,
      totalScore: totalCorrect,
      subjectBreakdown,
    };
  } catch (err) {
    console.error("Error reading local stats:", err);
    return emptyStats();
  }
}

function emptyStats(): UserStats {
  return { quizzesTaken: 0, totalCorrect: 0, totalAttempted: 0, accuracy: 0, currentStreak: 0, totalScore: 0, subjectBreakdown: {} };
}

function calculateStreakFromResults(results: any[]): number {
  const dates = results
    .map((r) => r.completed_at?.split("T")[0])
    .filter(Boolean);

  if (dates.length === 0) return 0;

  const uniqueDates = [...new Set(dates)].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const current = new Date(uniqueDates[i - 1]);
    const prev = new Date(uniqueDates[i]);
    const diffDays = Math.round((current.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
