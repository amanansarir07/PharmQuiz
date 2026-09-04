// Scheduled mock-exam helpers.
// Backed by the `mock_exams` table (see supabase/migrations/005_mock_exams.sql).
// All date math treats Kathmandu (Asia/Kathmandu, UTC+05:45, no DST) as the
// single source of truth for scheduling and display.
import { getSupabase } from "@/lib/supabase/client";

export interface MockExam {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  created_at: string;
}

const NEPAL_OFFSET_MS = (5 * 60 + 45) * 60 * 1000; // +05:45

/**
 * Build the quiz-session config used to start a scheduled exam, shared by the
 * dashboard and the mock-test page so join behaviour stays identical. The
 * timer runs from join-time but is capped at the exam window so a late joiner
 * doesn't finish long after everyone else.
 */
export function scheduledMockConfig(exam: MockExam): Record<string, unknown> {
  const windowMs = new Date(exam.ends_at).getTime() - Date.now();
  const timeLimit = Math.max(
    1,
    Math.min(exam.duration_minutes, Math.floor(windowMs / 60000))
  );
  return {
    mode: "mock",
    difficulty: "mixed",
    numQuestions: 10 * 8, // 8 subjects x 10 questions
    timeLimit,
    negativeMarking: false,
    revisionMode: false,
    title: exam.title,
    scheduled: true,
  };
}

/**
 * Interpret a wall-clock string (from <input type="datetime-local">) as
 * Kathmandu time → UTC instant. The digits are read directly (Date.UTC) so
 * the result never depends on the device's own timezone: wall − 05:45 = UTC.
 */
export function kathmanduWallToUtc(naiveIso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(naiveIso || "");
  if (!m) return new Date(NaN);
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const h = Number(m[4]);
  const mi = Number(m[5]);
  return new Date(Date.UTC(y, mo - 1, d, h, mi) - NEPAL_OFFSET_MS);
}

/**
 * Convert a stored UTC instant to a naive "YYYY-MM-DDTHH:mm" wall-clock string
 * in Kathmandu time, for filling <input type="datetime-local"> when editing.
 */
export function utcToKathmanduWall(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (t: string) => (parts.find((p) => p.type === t) || {}).value || "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Format a stored UTC instant for display in Kathmandu time. */
export function formatInKathmandu(
  iso: string,
  style: "full" | "short" = "full"
): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const opts: Intl.DateTimeFormatOptions =
    style === "short"
      ? {
          timeZone: "Asia/Kathmandu",
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }
      : {
          timeZone: "Asia/Kathmandu",
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        };
  return d.toLocaleString("en-GB", opts);
}

/** True when `now` falls inside the exam window. */
export function isExamLive(exam: MockExam, now = new Date()): boolean {
  const start = new Date(exam.starts_at).getTime();
  const end = new Date(exam.ends_at).getTime();
  return now.getTime() >= start && now.getTime() <= end;
}

export function isExamOver(exam: MockExam, now = new Date()): boolean {
  return now.getTime() > new Date(exam.ends_at).getTime();
}

/**
 * Fetch scheduled mocks that haven't ended yet, soonest first.
 * Errors (e.g. table not created yet) resolve to [] so the UI never breaks.
 */
export async function fetchUpcomingExams(): Promise<MockExam[]> {
  try {
    const { data, error } = await getSupabase()
      .from("mock_exams")
      .select("*")
      .gt("ends_at", new Date().toISOString())
      .order("starts_at", { ascending: true });
    if (error) {
      console.warn("fetchUpcomingExams:", error.message);
      return [];
    }
    return (data || []) as MockExam[];
  } catch (err) {
    console.warn("fetchUpcomingExams failed:", err);
    return [];
  }
}

/** Admin: fetch every scheduled exam, soonest first (past included). */
export async function fetchAllExams(): Promise<MockExam[]> {
  const { data, error } = await getSupabase()
    .from("mock_exams")
    .select("*")
    .order("starts_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []) as MockExam[];
}

/** Admin: create a scheduled mock. `startsAtIso` is a Nepal wall-clock string. */
export async function createMockExam(input: {
  title: string;
  startsAt: string; // "YYYY-MM-DDTHH:mm" in Kathmandu time
  durationMinutes: number;
}): Promise<MockExam> {
  const startsAt = kathmanduWallToUtc(input.startsAt);
  const endsAt = new Date(
    startsAt.getTime() + input.durationMinutes * 60 * 1000
  );
  const { data, error } = await getSupabase()
    .from("mock_exams")
    .insert({
      title: input.title.trim() || "Mock Test",
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      duration_minutes: input.durationMinutes,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as MockExam;
}

/** Admin: update (reschedule) a scheduled mock. `startsAt` is Nepal wall-clock. */
export async function updateMockExam(
  id: string,
  input: { title: string; startsAt: string; durationMinutes: number }
): Promise<MockExam> {
  const startsAt = kathmanduWallToUtc(input.startsAt);
  const endsAt = new Date(
    startsAt.getTime() + input.durationMinutes * 60 * 1000
  );
  const { data, error } = await getSupabase()
    .from("mock_exams")
    .update({
      title: input.title.trim() || "Mock Test",
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      duration_minutes: input.durationMinutes,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as MockExam;
}

/** Admin: delete a scheduled mock. */
export async function deleteMockExam(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("mock_exams")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
