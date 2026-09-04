"use client";

import { supabase } from "@/lib/supabase/client";
import { getLocalQuizResults, type LocalQuizResult } from "@/lib/storage";

export interface HistoryEntry {
  /** Stable key for React lists. */
  key: string;
  subject: string;
  correct: number;
  total: number;
  score: number;
  timeTaken: number | null;
  completedAt: string;
  /** True when full per-question detail exists locally (results page works). */
  hasLocalDetail: boolean;
  /** localStorage session id used to open the detailed results page. */
  localSessionId?: string;
}

interface SupabaseQuizRow {
  id: string;
  subject: string;
  correct: number;
  total: number;
  score: number | null;
  time_taken: number | null;
  completed_at: string;
}

/**
 * Combined quiz history: every result saved on this device (has full detail)
 * plus results stored in Supabase (survive device changes / storage clears).
 * Local entries win when the same quiz exists in both places so the detailed
 * review stays reachable — Supabase rows are added only when no local match.
 */
export async function getQuizHistory(userId?: string): Promise<HistoryEntry[]> {
  const local = getLocalQuizResults();

  const localEntries: HistoryEntry[] = local.map((r: LocalQuizResult) => ({
    key: `local-${r.sessionId}`,
    subject: r.subject,
    correct: r.correct,
    total: r.total,
    score: r.score,
    timeTaken: r.timeTaken,
    completedAt: r.completedAt,
    hasLocalDetail: true,
    localSessionId: r.sessionId,
  }));

  if (!userId) return localEntries;

  let remote: SupabaseQuizRow[] = [];
  try {
    const { data, error } = await supabase
      .from("quiz_results")
      .select("id, subject, correct, total, score, time_taken, completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (!error && data && data.length > 0) {
      remote = data as SupabaseQuizRow[];
    }
  } catch {
    // Supabase unavailable — local history only
  }

  if (remote.length === 0) return localEntries;

  // Same quiz recorded both locally and remotely shows up twice (the local
  // write and the RPC insert happen moments apart). Drop remote rows that
  // match a local entry on subject + correct + total + close completion time.
  const matchedLocal = new Set<string>();
  const merged: HistoryEntry[] = [];

  for (const entry of localEntries) {
    const matchIdx = remote.findIndex((r) =>
      r.subject === entry.subject &&
      r.correct === entry.correct &&
      r.total === entry.total &&
      Math.abs(new Date(r.completed_at).getTime() - new Date(entry.completedAt).getTime()) < 120_000
    );
    if (matchIdx !== -1) {
      matchedLocal.add(remote[matchIdx].id);
    }
  }

  for (const r of remote) {
    if (matchedLocal.has(r.id)) continue;
    merged.push({
      key: `remote-${r.id}`,
      subject: r.subject,
      correct: r.correct,
      total: r.total,
      score: typeof r.score === "number" ? r.score : r.correct,
      timeTaken: r.time_taken,
      completedAt: r.completed_at,
      hasLocalDetail: false,
    });
  }

  return [...localEntries, ...merged].sort((a, b) =>
    (b.completedAt || "").localeCompare(a.completedAt || "")
  );
}
