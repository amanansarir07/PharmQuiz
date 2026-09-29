import { safeGetItem, safeSetItem } from "@/lib/storage";
import type { QuizQuestion } from "@/lib/quiz-loader";
import { DEFAULT_PROGRAM_SLUG } from "@/data/registry";

const RESULTS_PREFIX = "quiz-results-";

export interface MistakeItem {
  question: QuizQuestion;
  userSelectedIndex: number | null;
  timestamp: string;
  subjectSlug: string;
}

/**
 * Scan all locally stored quiz results to extract questions answered incorrectly.
 * De-duplicates by question ID so each mistake appears once.
 */
export function getMistakeQuestions(
  programSlug: string = DEFAULT_PROGRAM_SLUG
): QuizQuestion[] {
  if (typeof window === "undefined") return [];

  const mistakeMap = new Map<string, QuizQuestion>();

  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(RESULTS_PREFIX)) continue;

      const raw = safeGetItem(key);
      if (!raw) continue;

      try {
        const data = JSON.parse(raw);
        if (!data || !data.questions || !data.answers) continue;

        // Verify program filter if provided
        const rowProgram = data.config?.program;
        if (programSlug && rowProgram && rowProgram !== programSlug) {
          continue;
        }

        const questions: QuizQuestion[] = data.questions;
        const answers: {
          questionId?: string;
          selected?: number | null;
          isCorrect?: boolean;
        }[] = data.answers;

        answers.forEach((ans, idx) => {
          if (!ans.isCorrect && ans.selected !== null) {
            const q = questions[idx];
            if (q && q.question) {
              const qKey = q.id || q.question.trim().toLowerCase();
              if (!mistakeMap.has(qKey)) {
                mistakeMap.set(qKey, q);
              }
            }
          }
        });
      } catch {
        // Skip corrupt entry
      }
    }
  } catch {
    // Ignore storage errors
  }

  return Array.from(mistakeMap.values());
}

/**
 * Get count of unique mistakes available for the given program.
 */
export function getMistakesCount(
  programSlug: string = DEFAULT_PROGRAM_SLUG
): number {
  return getMistakeQuestions(programSlug).length;
}

/**
 * Launch a dedicated practice session targeting mistakes.
 * Returns the created sessionId, or null if no mistakes exist.
 */
export function createMistakesSession(
  programSlug: string = DEFAULT_PROGRAM_SLUG,
  limit: number = 20
): string | null {
  const allMistakes = getMistakeQuestions(programSlug);
  if (allMistakes.length === 0) return null;

  // Shuffle mistakes and take up to limit
  const shuffled = [...allMistakes].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, limit);

  const sessionId = crypto.randomUUID();
  const config = {
    mode: "mistakes",
    title: "Mistakes Revision Practice",
    subject: selected[0]?.subjectSlug || "all",
    program: programSlug,
    difficulty: "mixed",
    numQuestions: selected.length,
    timeLimit: Math.ceil(selected.length * 1.5), // 1.5 min per question
    negativeMarking: false,
    createdAt: new Date().toISOString(),
  };

  // Seed question snapshot & config
  safeSetItem(`quiz-questions-${sessionId}`, JSON.stringify(selected));
  safeSetItem(`quiz-config-${sessionId}`, JSON.stringify(config));

  return sessionId;
}
