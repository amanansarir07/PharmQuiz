import type { Question } from "@/lib/types";
import pharmaceuticsQuestions from "@/data/questions/pharmaceutics-i.json";
import pharmacologyQuestions from "@/data/questions/pharmacology-i.json";
import chemistryQuestions from "@/data/questions/pharmaceutical-chemistry-i.json";
import pharmacognosyQuestions from "@/data/questions/pharmacognosy.json";
import bioMicroQuestions from "@/data/questions/biochemistry-microbiology.json";
import pharmacotherapeuticsQuestions from "@/data/questions/pharmacotherapeutics-i.json";
import managementQuestions from "@/data/questions/pharmaceutical-management.json";
import publicHealthQuestions from "@/data/questions/public-health-pharmacy.json";

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

  return filtered.map((q, i) => ({
    id: `quiz-q-${i}-${Date.now()}`,
    question: q.question_text,
    options: q.options,
    correctIndex: q.correct_index,
    explanation: q.explanation,
    difficulty: q.difficulty,
    unitId: q.unit_id,
  }));
}

export function getAllQuestions(): QuizQuestion[] {
  const all: QuizQuestion[] = [];
  for (const questions of Object.values(allQuestionsBySubject)) {
    for (const q of questions) {
      all.push({
        id: q.unit_id + "-" + q.question_text.substring(0, 20),
        question: q.question_text,
        options: q.options,
        correctIndex: q.correct_index,
        explanation: q.explanation,
        difficulty: q.difficulty,
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
