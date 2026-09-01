"use client";

import { supabase } from "@/lib/supabase/client";

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

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data } = await supabase
    .from("leaderboard_view")
    .select("*")
    .order("total_correct", { ascending: false });

  if (!data) return [];

  const entries: LeaderboardEntry[] = data.map((row, i) => ({
    rank: i + 1,
    name: row.name,
    email: row.email,
    quizzesTaken: row.quizzes_taken,
    totalCorrect: row.total_correct,
    totalAttempted: 0,
    accuracy: row.accuracy || 0,
    currentStreak: 0,
    isAdmin: row.role === "admin",
  }));

  return entries;
}
