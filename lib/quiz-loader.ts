import { DEFAULT_PROGRAM_SLUG, getContentSourceProgramSlug, getPrograms, getSubjectsForProgram } from "@/data/registry";
import {
  getBankSubjectSlugs,
  loadAllBanks,
  loadBank,
  loadProgramBanks,
  resolveBankProgram,
  type RawBankQuestion,
} from "@/lib/content/banks";
import {
  getLegacyPublishedSubjectSlug,
  getPublishedQuestionCount,
  getPublishedQuestions,
  getPublishedSubjectQuestionCount,
  getPublishedSubjectSlugs,
} from "@/lib/bulk-question-import";

/**
 * Question loading for quizzes, mock papers and the review browser.
 *
 * Every entry point is async: banks are loaded lazily per subject (see
 * `lib/content/banks.ts`), so a visitor only pays for the curriculum they
 * actually open.
 */

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

export interface QuizLoadOptions {
  subjectSlug: string;
  unitIds?: string[];
  difficulty?: string;
  numQuestions?: number;
  /** Defaults to the programme that owns the subject's bank. */
  programSlug?: string;
}

async function loadQuestionPool(subjectSlug: string, programSlug: string): Promise<RawBankQuestion[]> {
  const contentProgramSlug = getContentSourceProgramSlug(programSlug);
  const [staticBank, imported] = await Promise.all([
    loadBank(subjectSlug, contentProgramSlug),
    getPublishedQuestions(contentProgramSlug, subjectSlug),
  ]);
  const legacySubjectSlug = getLegacyPublishedSubjectSlug(programSlug, subjectSlug);
  return [
    ...staticBank,
    ...imported.map((question) => ({
      unit_id: legacySubjectSlug !== subjectSlug && question.unit_id.startsWith(`${legacySubjectSlug}-unit-`)
        ? `${subjectSlug}${question.unit_id.slice(legacySubjectSlug.length)}`
        : question.unit_id,
      question_text: question.question_text,
      options: question.options,
      correct_index: question.correct_index,
      explanation: question.explanation,
      difficulty: question.difficulty,
      tags: question.tags,
    })),
  ];
}

function normalizeOptions(q: RawBankQuestion): string[] {
  // Handle both array and object formats
  if (Array.isArray(q.options)) {
    return q.options;
  }
  if (q.options && typeof q.options === "object") {
    return [
      q.options.a || "",
      q.options.b || "",
      q.options.c || "",
      q.options.d || "",
    ];
  }
  return [];
}

function getCorrectIndex(q: RawBankQuestion): number {
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

/** Fisher–Yates shuffle of a copy, keeping the correct answer tracked. */
function shuffleWithAnswer(
  options: string[],
  correctIndex: number
): { options: string[]; correctIndex: number } {
  const shuffled = [...options];
  let next = correctIndex;
  for (let j = shuffled.length - 1; j > 0; j--) {
    const k = Math.floor(Math.random() * (j + 1));
    [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
    if (j === next) next = k;
    else if (k === next) next = j;
  }
  return { options: shuffled, correctIndex: next };
}

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** Build a single-subject quiz from the subject's bank. */
export async function getQuestionsForQuiz({
  subjectSlug,
  unitIds,
  difficulty,
  numQuestions,
  programSlug,
}: QuizLoadOptions): Promise<QuizQuestion[]> {
  const resolvedProgram = programSlug ?? resolveBankProgram(subjectSlug);
  const bank = await loadQuestionPool(subjectSlug, resolvedProgram);

  let filtered = [...bank];

  // Filter by units (legacy entries without a unit_id are never unit-matched)
  if (unitIds && unitIds.length > 0) {
    const matchedUnits = filtered.filter(
      (q) => q.unit_id !== undefined && unitIds.includes(q.unit_id)
    );
    if (matchedUnits.length > 0) {
      filtered = matchedUnits;
    } else {
      // Imports created before unit metadata was introduced used `all` as the
      // batch unit. Keep those published questions usable for a whole-subject
      // practice session until the source JSON is re-imported with real units.
      const legacyWholeSubject = filtered.filter((q) => q.unit_id === "all");
      filtered = legacyWholeSubject.length > 0 ? legacyWholeSubject : matchedUnits;
    }
  }

  // Filter by difficulty
  if (difficulty && difficulty !== "mixed") {
    filtered = filtered.filter((q) => q.difficulty === difficulty);
  }

  shuffleInPlace(filtered);

  // Limit
  if (numQuestions && numQuestions > 0) {
    filtered = filtered.slice(0, numQuestions);
  }

  return filtered.map((q, i) => {
    const shuffled = shuffleWithAnswer(normalizeOptions(q), getCorrectIndex(q));
    return {
      id: `quiz-q-${i}-${Date.now()}`,
      question: q.question_text,
      options: shuffled.options,
      correctIndex: shuffled.correctIndex,
      explanation: q.explanation || "",
      difficulty: q.difficulty || "medium",
      unitId: q.unit_id || "",
    };
  });
}

/** Shape a set of raw banks into review-ready questions. */
function toQuizQuestions(
  banks: { subjectSlug: string; questions: RawBankQuestion[] }[]
): QuizQuestion[] {
  const all: QuizQuestion[] = [];
  for (const bank of banks) {
    for (const [index, q] of bank.questions.entries()) {
      const shuffled = shuffleWithAnswer(
        normalizeOptions(q),
        getCorrectIndex(q)
      );
      all.push({
        // Bank order is stable; truncated question text can collide.
        id: `${bank.subjectSlug}-${index}`,
        question: q.question_text,
        options: shuffled.options,
        correctIndex: shuffled.correctIndex,
        explanation: q.explanation || "",
        difficulty: q.difficulty || "medium",
        unitId: q.unit_id || "",
        subjectSlug: bank.subjectSlug,
      });
    }
  }
  return all;
}

/**
 * Every question in one programme's published banks. This is what the review
 * browser always wanted: previously it loaded every bank in the app (which
 * grows without limit as programmes are added) and then filtered the subject
 * dropdown down to a single hardcoded programme anyway.
 */
export async function getProgramQuestions(
  programSlug: string = DEFAULT_PROGRAM_SLUG
): Promise<QuizQuestion[]> {
  const importedSubjects = await getPublishedSubjectSlugs(programSlug);
  const subjectSlugs = [...new Set([
    ...getSubjectsForProgram(programSlug).map((subject) => subject.slug),
    ...importedSubjects,
  ])];
  return toQuizQuestions(await Promise.all(subjectSlugs.map(async (subjectSlug) => ({
    subjectSlug,
    questions: await loadQuestionPool(subjectSlug, programSlug),
  }))));
}

/** A lightweight question-bank preview for one subject. */
export async function getSubjectQuestions(
  subjectSlug: string,
  programSlug: string = DEFAULT_PROGRAM_SLUG
): Promise<QuizQuestion[]> {
  return toQuizQuestions([{ subjectSlug, questions: await loadQuestionPool(subjectSlug, programSlug) }]);
}

/** Every question across every published bank, with options shuffled. */
export async function getAllQuestions(): Promise<QuizQuestion[]> {
  return toQuizQuestions(await loadAllBanks());
}

/** How many questions a programme's published banks hold. */
export async function getQuestionCount(
  programSlug: string = DEFAULT_PROGRAM_SLUG
): Promise<number> {
  const contentProgramSlug = getContentSourceProgramSlug(programSlug);
  const banks = await loadProgramBanks(contentProgramSlug);
  const [staticCount, importedCount] = await Promise.all([
    Promise.resolve(banks.reduce((acc, b) => acc + b.questions.length, 0)),
    getPublishedQuestionCount(contentProgramSlug),
  ]);
  return staticCount + importedCount;
}

/** Question-bank subject slugs available to practice in a programme. */
export async function getProgramQuestionSubjectSlugs(programSlug: string): Promise<string[]> {
  const contentProgramSlug = getContentSourceProgramSlug(programSlug);
  const [publishedSubjectSlugs, staticSubjectSlugs] = await Promise.all([
    getPublishedSubjectSlugs(programSlug),
    Promise.resolve(getBankSubjectSlugs(contentProgramSlug)),
  ]);
  return [...new Set([...staticSubjectSlugs, ...publishedSubjectSlugs])];
}

/** Number of questions available for one subject in a programme. */
export async function getSubjectQuestionCount(
  subjectSlug: string,
  programSlug: string = resolveBankProgram(subjectSlug)
): Promise<number> {
  const contentProgramSlug = getContentSourceProgramSlug(programSlug);
  const [staticBank, importedCount] = await Promise.all([
    loadBank(subjectSlug, contentProgramSlug),
    getPublishedSubjectQuestionCount(contentProgramSlug, subjectSlug),
  ]);
  return staticBank.length + importedCount;
}

/** Question totals for every programme that has a bank, keyed by programme slug. */
export async function getProgrammeQuestionCounts(): Promise<
  Record<string, number>
> {
  const entries = await Promise.all(
    getPrograms().filter((program) => program.hasContent).map(
      async (program) => [program.slug, await getQuestionCount(program.slug)] as const
    )
  );
  return Object.fromEntries(entries);
}

/** Subject slugs with a wired question bank (no bank contents loaded). */
export { getBankSubjectSlugs };

/**
 * Build a full mock-test paper: `perSubject` questions drawn at random from
 * each subject in the programme, grouped subject-by-subject in syllabus order.
 * Each returned question carries its subject so the UI can label sections.
 */
export async function getMockQuestions(
  perSubject = 10,
  programSlug: string = DEFAULT_PROGRAM_SLUG
): Promise<QuizQuestion[]> {
  const out: QuizQuestion[] = [];
  const stamp = Date.now();

  for (const s of getSubjectsForProgram(programSlug)) {
    const bank = await loadQuestionPool(s.slug, programSlug);
    if (bank.length === 0) continue;

    const unitIds = new Set(s.units.map((u) => u.id));
    let pool = bank.filter(
      (q) => q.unit_id !== undefined && unitIds.has(q.unit_id)
    );
    if (pool.length < perSubject) {
      const seen = new Set(pool.map((q) => q.question_text));
      const rest = bank.filter((q) => !seen.has(q.question_text));
      pool = pool.concat(rest);
    }
    if (pool.length === 0) continue;

    shuffleInPlace(pool);

    pool.slice(0, perSubject).forEach((q, k) => {
      const shuffled = shuffleWithAnswer(
        normalizeOptions(q),
        getCorrectIndex(q)
      );
      out.push({
        id: `${s.slug}-mock-${stamp}-${k}-${Math.floor(Math.random() * 1e6)}`,
        question: q.question_text,
        options: shuffled.options,
        correctIndex: shuffled.correctIndex,
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
 * Look up a full question from a local or published bank by subject + exact text.
 * Returns the question in natural (file) order — NOT shuffled — with the
 * bank's own correct index. Used to rehydrate slim records like bookmarks.
 */
export async function findBankQuestion(
  subjectSlug: string | undefined,
  questionText: string,
  programSlug?: string
): Promise<(QuizQuestion & { subjectSlug: string }) | null> {
  const banks = subjectSlug
    ? [{
        subjectSlug,
        questions: await loadQuestionPool(
          subjectSlug,
          programSlug ?? resolveBankProgram(subjectSlug)
        ),
      }]
    : await loadAllBanks();

  for (const bank of banks) {
    const found = bank.questions.find((q) => q.question_text === questionText);
    if (found) {
      return {
        id: found.unit_id
          ? found.unit_id + "-" + questionText.substring(0, 20)
          : bank.subjectSlug + "-" + questionText.substring(0, 20),
        question: found.question_text,
        options: normalizeOptions(found),
        correctIndex: getCorrectIndex(found),
        explanation: found.explanation || "",
        difficulty: found.difficulty || "medium",
        unitId: found.unit_id || "",
        subjectSlug: bank.subjectSlug,
      };
    }
  }
  return null;
}
