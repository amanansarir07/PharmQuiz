// Safe localStorage helpers.
//
// Quiz sessions store large payloads (full question objects) under
// `quiz-results-*` keys. Browsers cap localStorage at ~5MB, and once the
// quota is hit every subsequent setItem throws — which used to break quiz
// submission silently and made dashboards/history look like they "reset".
// These helpers make writes non-fatal and prune old results when space runs out.

const RESULTS_PREFIX = "quiz-results-";
const CONFIG_PREFIX = "quiz-config-";
const PROGRESS_PREFIX = "quiz-progress-";

export function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeRemoveItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    // Quota exceeded (or storage disabled). Drop the oldest quiz results so
    // the newest data always survives, then retry once.
    if (pruneOldestResults(1)) {
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export interface LocalQuizResult {
  sessionId: string;
  subject: string;
  correct: number;
  total: number;
  score: number;
  timeTaken: number | null;
  completedAt: string;
}

/** Read every locally saved quiz result, newest first. */
export function getLocalQuizResults(): LocalQuizResult[] {
  if (typeof window === "undefined") return [];
  const results: LocalQuizResult[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(RESULTS_PREFIX)) continue;
      const raw = safeGetItem(key);
      if (!raw) continue;
      try {
        const data = JSON.parse(raw);
        if (!data || !data.answers || !data.questions) continue;
        const correct = data.answers.filter((a: any) => a.isCorrect).length;
        const total = data.questions.length;
        results.push({
          sessionId: key.slice(RESULTS_PREFIX.length),
          subject: data.config?.subject || "unknown",
          correct,
          total,
          score: typeof data.score === "number" ? data.score : correct,
          timeTaken: typeof data.timeTaken === "number" ? data.timeTaken : null,
          completedAt: data.config?.completedAt || "",
        });
      } catch {
        // Skip corrupt entry but keep the key list below for pruning
      }
    }
  } catch {
    // ignore
  }
  results.sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""));
  return results;
}

/**
 * Persist a completed quiz result locally, surviving quota pressure by
 * removing the oldest saved results when needed.
 */
export function saveQuizResultLocal(
  sessionId: string,
  payload: unknown
): boolean {
  return safeSetItem(`${RESULTS_PREFIX}${sessionId}`, JSON.stringify(payload));
}

/** Delete old quiz-config / quiz-progress scratch keys (48h+ old). */
export function pruneExpiredScratchKeys(): void {
  if (typeof window === "undefined") return;
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  try {
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      const isScratch = key.startsWith(CONFIG_PREFIX) || key.startsWith(PROGRESS_PREFIX);
      if (!isScratch) continue;
      const raw = safeGetItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const stamp = parsed?.savedAt || parsed?.completedAt;
        if (typeof stamp === "number" && stamp < cutoff) {
          window.localStorage.removeItem(key);
        } else if (typeof stamp === "string" && new Date(stamp).getTime() < cutoff) {
          window.localStorage.removeItem(key);
        }
      } catch {
        // Corrupt scratch key — safe to drop
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}

function pruneOldestResults(count: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const results = getLocalQuizResults().sort((a, b) =>
      (a.completedAt || "").localeCompare(b.completedAt || "")
    );
    for (let i = 0; i < Math.min(count, results.length); i++) {
      window.localStorage.removeItem(`${RESULTS_PREFIX}${results[i].sessionId}`);
    }
    return true;
  } catch {
    return false;
  }
}
