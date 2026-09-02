"use client";

import { supabase } from "@/lib/supabase/client";

export interface UserStats {
  quizzesTaken: number;
  totalCorrect: number;
  totalAttempted: number;
  accuracy: number;
  currentStreak: number;
  totalScore: number;
  subjectBreakdown: Record<string, { correct: number; total: number; accuracy: number }>;
}

export async function calculateStats(userId?: string): Promise<UserStats> {
  if (!userId) {
    return getLocalStats();
  }

  try {
    const { data: results, error } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error || !results || results.length === 0) {
      // Fallback to localStorage
      return getLocalStats();
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
 * Reads quiz-results-* keys written by the quiz page.
 */
function getLocalStats(): UserStats {
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

export function getSubjectName(slug: string): string {
  const names: Record<string, string> = {
    "pharmaceutics-i": "Pharmaceutics I",
    "pharmacology-i": "Pharmacology I",
    "pharmaceutical-chemistry-i": "Pharmaceutical Chemistry I",
    pharmacognosy: "Pharmacognosy",
    "biochemistry-microbiology": "Biochemistry & Microbiology",
    "pharmacotherapeutics-i": "Pharmacotherapeutics I",
    "pharmaceutical-management": "Pharmaceutical Management",
    "public-health-pharmacy": "Public Health Pharmacy",
  };
  return names[slug] || slug;
}
