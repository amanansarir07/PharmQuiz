"use client";

import { supabase } from "@/lib/supabase/client";

export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "all_time";

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  email: string;
  quizzesTaken: number;
  totalCorrect: number;
  totalAttempted: number;
  accuracy: number;
  avgAccuracy: number;
  score: number;
  qualified: boolean;
  quizzesNeeded: number;
}

export interface UserLeaderboardPosition {
  rank: number;
  totalParticipants: number;
  qualified: boolean;
  quizzesNeeded: number;
  quizzesTaken: number;
  totalCorrect: number;
  accuracy: number;
}

export const PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  all_time: "All-Time",
};

export const PERIOD_MIN_QUIZZES: Record<LeaderboardPeriod, number> = {
  daily: 1,
  weekly: 5,
  monthly: 10,
  all_time: 20,
};

export const PERIOD_DESCRIPTIONS: Record<LeaderboardPeriod, string> = {
  daily: "Resets every day at midnight",
  weekly: "Resets every Monday",
  monthly: "Resets on the 1st of each month",
  all_time: "Never resets",
};

interface LeaderboardRow {
  rank: number;
  user_id: string;
  name: string;
  email: string;
  quizzes_taken: number;
  total_correct: number;
  total_attempted: number;
  accuracy: number | string;
  avg_accuracy: number | string;
  score: number | string;
  qualified: boolean;
  quizzes_needed: number;
}

interface UserPositionRow {
  rank: number;
  total_participants: number;
  qualified: boolean;
  quizzes_needed: number;
  quizzes_taken: number;
  total_correct: number;
  accuracy: number | string;
}

export async function getLeaderboard(
  period: LeaderboardPeriod = "all_time",
  limit: number = 100,
  offset: number = 0
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc("get_leaderboard", {
    p_period: period,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error("Leaderboard error:", error);
    return [];
  }

  return (data || []).map((row: LeaderboardRow) => ({
    rank: row.rank,
    user_id: row.user_id,
    name: row.name,
    email: row.email,
    quizzesTaken: row.quizzes_taken,
    totalCorrect: row.total_correct,
    totalAttempted: row.total_attempted,
    accuracy: Number(row.accuracy),
    avgAccuracy: Number(row.avg_accuracy),
    score: Number(row.score),
    qualified: row.qualified,
    quizzesNeeded: row.quizzes_needed,
  }));
}

export async function getUserLeaderboardPosition(
  userId: string,
  period: LeaderboardPeriod = "all_time"
): Promise<UserLeaderboardPosition | null> {
  const { data, error } = await supabase.rpc("get_user_leaderboard_position", {
    p_user_id: userId,
    p_period: period,
  });

  if (error) {
    console.error("User leaderboard position error:", error);
    return null;
  }

  if (!data || data.length === 0) return null;

  const row = data[0] as UserPositionRow;
  return {
    rank: row.rank,
    totalParticipants: row.total_participants,
    qualified: row.qualified,
    quizzesNeeded: row.quizzes_needed,
    quizzesTaken: row.quizzes_taken,
    totalCorrect: row.total_correct,
    accuracy: Number(row.accuracy),
  };
}