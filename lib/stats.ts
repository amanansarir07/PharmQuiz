"use client";

export interface UserStats {
  quizzesTaken: number;
  totalCorrect: number;
  totalAttempted: number;
  accuracy: number;
  currentStreak: number;
  totalScore: number;
  subjectBreakdown: Record<string, { correct: number; total: number; accuracy: number }>;
}

export function calculateStats(): UserStats {
  if (typeof window === "undefined") {
    return { quizzesTaken: 0, totalCorrect: 0, totalAttempted: 0, accuracy: 0, currentStreak: 0, totalScore: 0, subjectBreakdown: {} };
  }

  let totalCorrect = 0;
  let totalAttempted = 0;
  let quizzesTaken = 0;
  const subjectBreakdown: Record<string, { correct: number; total: number; accuracy: number }> = {};

  // Scan all localStorage keys for quiz results
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("quiz-results-")) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        if (!data.answers || !data.questions) continue;

        quizzesTaken++;

        // Count correct and attempted
        for (const answer of data.answers) {
          if (answer.selected !== null) {
            totalAttempted++;
            if (answer.isCorrect) totalCorrect++;
          }
        }

        // Subject breakdown
        const subjectSlug = data.config?.subject;
        if (subjectSlug) {
          if (!subjectBreakdown[subjectSlug]) {
            subjectBreakdown[subjectSlug] = { correct: 0, total: 0, accuracy: 0 };
          }
          for (const answer of data.answers) {
            if (answer.selected !== null) {
              subjectBreakdown[subjectSlug].total++;
              if (answer.isCorrect) subjectBreakdown[subjectSlug].correct++;
            }
          }
        }
      } catch {
        // Skip invalid entries
      }
    }
  }

  // Calculate accuracy
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Calculate accuracy per subject
  for (const subject of Object.values(subjectBreakdown)) {
    subject.accuracy = subject.total > 0 ? Math.round((subject.correct / subject.total) * 100) : 0;
  }

  // Calculate score (1 point per correct answer)
  const totalScore = totalCorrect;

  // Calculate streak (simplified: count consecutive days with quizzes)
  const currentStreak = calculateStreak();

  return {
    quizzesTaken,
    totalCorrect,
    totalAttempted,
    accuracy,
    currentStreak,
    totalScore,
    subjectBreakdown,
  };
}

function calculateStreak(): number {
  const dates: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("quiz-results-")) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        if (data.config?.completedAt) {
          dates.push(data.config.completedAt.split("T")[0]);
        }
      } catch {}
    }
  }

  if (dates.length === 0) return 0;

  // Sort dates descending
  const uniqueDates = [...new Set(dates)].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Streak must start from today or yesterday
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
