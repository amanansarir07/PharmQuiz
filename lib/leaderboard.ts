"use client";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  email: string;
  quizzesTaken: number;
  totalCorrect: number;
  totalAttempted: number;
  accuracy: number;
  currentStreak: number;
  isAdmin: boolean;
}

interface StoredUser {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  password: string;
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];

  try {
    // Get all registered users
    const usersRaw = localStorage.getItem("pharmquiz_users");
    if (!usersRaw) return [];

    const users: Record<string, StoredUser> = JSON.parse(usersRaw);

    // Calculate stats for each user (using a shared results key for simplicity)
    // In a real app this would be per-user in a database
    const entries: LeaderboardEntry[] = [];

    for (const [, entry] of Object.entries(users)) {
      const u = entry.user;

      // Count quiz results — since localStorage is per-browser,
      // we'll attribute all results to the current user
      // For a real leaderboard this would need a backend
      let quizzesTaken = 0;
      let totalCorrect = 0;
      let totalAttempted = 0;

      // We check for user-specific results
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("quiz-results-")) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "{}");
            if (data.answers && data.questions) {
              quizzesTaken++;
              for (const answer of data.answers) {
                if (answer.selected !== null) {
                  totalAttempted++;
                  if (answer.isCorrect) totalCorrect++;
                }
              }
            }
          } catch {}
        }
      }

      const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

      // Calculate streak
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

      let currentStreak = 0;
      const uniqueDates = [...new Set(dates)].sort().reverse();
      if (uniqueDates.length > 0) {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
          currentStreak = 1;
          for (let i = 1; i < uniqueDates.length; i++) {
            const curr = new Date(uniqueDates[i - 1]);
            const prev = new Date(uniqueDates[i]);
            const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
            if (diff === 1) currentStreak++;
            else break;
          }
        }
      }

      entries.push({
        rank: 0,
        name: u.name,
        email: u.email,
        quizzesTaken,
        totalCorrect,
        totalAttempted,
        accuracy,
        currentStreak,
        isAdmin: u.role === "admin",
      });
    }

    // Sort by score (totalCorrect), then accuracy
    entries.sort((a, b) => {
      if (b.totalCorrect !== a.totalCorrect) return b.totalCorrect - a.totalCorrect;
      return b.accuracy - a.accuracy;
    });

    // Assign ranks
    entries.forEach((e, i) => { e.rank = i + 1; });

    return entries;
  } catch {
    return [];
  }
}
