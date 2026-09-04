import type { Question } from "@/lib/types";
import pharmaceuticsQuestions from "@/data/questions/pharmaceutics-i.json";
import pharmacologyQuestions from "@/data/questions/pharmacology-i.json";
import chemistryQuestions from "@/data/questions/pharmaceutical-chemistry-i.json";
import pharmacognosyQuestions from "@/data/questions/pharmacognosy.json";
import bioMicroQuestions from "@/data/questions/biochemistry-microbiology.json";
import pharmacotherapeuticsQuestions from "@/data/questions/pharmacotherapeutics-i.json";
import managementQuestions from "@/data/questions/pharmaceutical-management.json";
import publicHealthQuestions from "@/data/questions/public-health-pharmacy.json";
import { subjects } from "@/data/subjects";

const allQuestionsBySubject: Record<string, any[]> = {
  "pharmaceutics-i": pharmaceuticsQuestions,
  "pharmacology-i": pharmacologyQuestions,
  "pharmaceutical-chemistry-i": chemistryQuestions,
  "pharmacognosy": pharmacognosyQuestions,
  "biochemistry-microbiology": bioMicroQuestions,
  "pharmacotherapeutics-i": pharmacotherapeuticsQuestions,
  "pharmaceutical-management": managementQuestions,
  "public-health-pharmacy": publicHealthQuestions,
};

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: string;
  unitId: string;
  subjectSlug?: string;
  subjectName?: string;
  subjectIcon?: string;
}

export function getQuestionsForQuiz(
  subjectSlug: string,
  unitIds?: string[],
  difficulty?: string,
  numQuestions?: number
): QuizQuestion[] {
  const subjectQuestions = allQuestionsBySubject[subjectSlug] || [];

  let filtered = [...subjectQuestions];

  // Filter by units
  if (unitIds && unitIds.length > 0) {
    filtered = filtered.filter((q) => unitIds.includes(q.unit_id));
  }

  // Filter by difficulty
  if (difficulty && difficulty !== "mixed") {
    filtered = filtered.filter((q) => q.difficulty === difficulty);
  }

  // Shuffle
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  // Limit
  if (numQuestions && numQuestions > 0) {
    filtered = filtered.slice(0, numQuestions);
  }

  return filtered.map((q, i) => {
    const options = normalizeOptions(q);
    const correctIndex = getCorrectIndex(q);
    // Shuffle options using Fisher-Yates and track new correct index
    const shuffled = [...options];
    let newCorrectIndex = correctIndex;
    for (let j = shuffled.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
      if (j === newCorrectIndex) newCorrectIndex = k;
      else if (k === newCorrectIndex) newCorrectIndex = j;
    }
    return {
      id: `quiz-q-${i}-${Date.now()}`,
      question: q.question_text,
      options: shuffled,
      correctIndex: newCorrectIndex,
      explanation: q.explanation || "",
      difficulty: q.difficulty || "medium",
      unitId: q.unit_id,
    };
  });
}

function normalizeOptions(q: any): string[] {
  // Handle both array and object formats
  if (Array.isArray(q.options)) {
    return q.options;
  }
  if (q.options && typeof q.options === "object") {
    return [q.options.a || "", q.options.b || "", q.options.c || "", q.options.d || ""];
  }
  return [];
}

function getCorrectIndex(q: any): number {
  // Handle correct_index (number) or correct_option (letter like "a")
  if (typeof q.correct_index === "number") {
    return q.correct_index;
  }
  if (typeof q.correct_option === "string") {
    const letterMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
    return letterMap[q.correct_option.toLowerCase()] ?? 0;
  }
  return 0;
}

export function getAllQuestions(): QuizQuestion[] {
  const all: QuizQuestion[] = [];
  for (const questions of Object.values(allQuestionsBySubject)) {
    for (const q of questions) {
      const options = normalizeOptions(q);
      const correctIndex = getCorrectIndex(q);
      // Shuffle options using Fisher-Yates and track new correct index
      const shuffled = [...options];
      let newCorrectIndex = correctIndex;
      for (let j = shuffled.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
        if (j === newCorrectIndex) newCorrectIndex = k;
        else if (k === newCorrectIndex) newCorrectIndex = j;
      }
      all.push({
        id: q.unit_id + "-" + q.question_text.substring(0, 20),
        question: q.question_text,
        options: shuffled,
        correctIndex: newCorrectIndex,
        explanation: q.explanation || "",
        difficulty: q.difficulty || "medium",
        unitId: q.unit_id,
      });
    }
  }
  return all;
}

export function getQuestionCount(): number {
  return Object.values(allQuestionsBySubject).reduce(
    (acc, q) => acc + q.length,
    0
  );
}

export interface MockSubjectSpec {
  slug: string;
  name: string;
  icon: string;
}

/**
 * Build a full mock-test paper: `perSubject` questions drawn at random from
 * each of the 8 subjects, grouped subject-by-subject in syllabus order.
 * Each returned question carries its subject so the UI can label sections.
 */
export function getMockQuestions(perSubject = 10): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  const stamp = Date.now();
  for (const s of subjects) {
    const bank = allQuestionsBySubject[s.slug] || [];
    if (bank.length === 0) continue;

    const unitIds = new Set(s.units.map((u) => u.id));
    let pool = bank.filter((q) => q.unit_id && unitIds.has(q.unit_id));
    if (pool.length < perSubject) {
      const seen = new Set(pool.map((q) => q.question_text));
      const rest = bank.filter((q) => !seen.has(q.question_text));
      pool = pool.concat(rest);
    }
    if (pool.length === 0) continue;

    // Fisher–Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    pool.slice(0, perSubject).forEach((q, k) => {
      const options = normalizeOptions(q);
      const correctIndex = getCorrectIndex(q);
      const shuffled = [...options];
      let newCorrectIndex = correctIndex;
      for (let j = shuffled.length - 1; j > 0; j--) {
        const m = Math.floor(Math.random() * (j + 1));
        [shuffled[j], shuffled[m]] = [shuffled[m], shuffled[j]];
        if (j === newCorrectIndex) newCorrectIndex = m;
        else if (m === newCorrectIndex) newCorrectIndex = j;
      }
      out.push({
        id: `${s.slug}-mock-${stamp}-${k}-${Math.floor(Math.random() * 1e6)}`,
        question: q.question_text,
        options: shuffled,
        correctIndex: newCorrectIndex,
        explanation: q.explanation || "",
        difficulty: q.difficulty || "medium",
        unitId: q.unit_id || "",
        subjectSlug: s.slug,
        subjectName: s.name,
        subjectIcon: s.icon,
      });
    });
  }
  return out;
}

/**
 * Look up a full question from the local bank by subject + exact text.
 * Returns the question in natural (file) order — NOT shuffled — with the
 * bank's own correct index. Used to rehydrate slim records like bookmarks.
 */
export function findBankQuestion(
  subjectSlug: string | undefined,
  questionText: string
): (QuizQuestion & { subjectSlug: string }) | null {
  const banks = subjectSlug && allQuestionsBySubject[subjectSlug]
    ? [subjectSlug]
    : Object.keys(allQuestionsBySubject);

  for (const slug of banks) {
    const found = (allQuestionsBySubject[slug] || []).find(
      (q) => q.question_text === questionText
    );
    if (found) {
      return {
        id: found.unit_id ? found.unit_id + "-" + questionText.substring(0, 20) : slug + "-" + questionText.substring(0, 20),
        question: found.question_text,
        options: normalizeOptions(found),
        correctIndex: getCorrectIndex(found),
        explanation: found.explanation || "",
        difficulty: found.difficulty || "medium",
        unitId: found.unit_id,
        subjectSlug: slug,
      };
    }
  }
  return null;
}
