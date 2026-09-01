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
    return { quizzesTaken: 0, totalCorrect: 0, totalAttempted: 0, accuracy: 0, currentStreak: 0, totalScore: 0, subjectBreakdown: {} };
  }

  const { data: results } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (!results || results.length === 0) {
    return { quizzesTaken: 0, totalCorrect: 0, totalAttempted: 0, accuracy: 0, currentStreak: 0, totalScore: 0, subjectBreakdown: {} };
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
    "pharmacognosy": "Pharmacognosy",
    "biochemistry-microbiology": "Biochemistry & Microbiology",
    "pharmacotherapeutics-i": "Pharmacotherapeutics I",
    "pharmaceutical-management": "Pharmaceutical Management",
    "public-health-pharmacy": "Public Health Pharmacy",
  };
  return names[slug] || slug;
}
