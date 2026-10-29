import { getSubjectName } from "@/data/registry";
import { getBankProgramSlugs, getBankSubjectSlugs, loadBank, type RawBankQuestion } from "@/lib/content/banks";
import { getSupabase } from "@/lib/supabase/client";
import type { PreviewQuestion } from "@/components/practice-preview";

const PREVIEW_SIZE = 5;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function preview(question: RawBankQuestion, subjectSlug: string): PreviewQuestion | null {
  const rawOptions = question.options;
  const options = Array.isArray(rawOptions)
    ? rawOptions
    : ["a", "b", "c", "d"].map((key) => rawOptions[key]);
  const correctIndex = question.correct_index ??
    (question.correct_option ? "abcd".indexOf(question.correct_option.toLowerCase()) : -1);
  if (!question.question_text || options.length < 2 || options.some((option) => !option) ||
    correctIndex < 0 || correctIndex >= options.length || !question.explanation?.trim()) return null;
  return {
    question: question.question_text,
    options,
    correctIndex,
    explanation: question.explanation,
    subject: getSubjectName(subjectSlug),
  };
}

async function staticSamples(): Promise<PreviewQuestion[]> {
  const banks = shuffle(getBankProgramSlugs().flatMap((programSlug) =>
    getBankSubjectSlugs(programSlug).map((subjectSlug) => ({ programSlug, subjectSlug }))));
  const sampled = await Promise.all(banks.slice(0, PREVIEW_SIZE).map(async ({ programSlug, subjectSlug }) => {
    const questions = await loadBank(subjectSlug, programSlug);
    for (const question of shuffle(questions)) {
      const sample = preview(question, subjectSlug);
      if (sample) return sample;
    }
    return null;
  }));
  return sampled.filter((sample): sample is PreviewQuestion => sample !== null);
}

async function publishedSamples(): Promise<PreviewQuestion[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const client = getSupabase();
    const { count, error: countError } = await client.from("published_questions")
      .select("id", { count: "exact", head: true });
    if (countError || !count) return [];

    // UUID order distributes adjacent rows across imports and programmes. A
    // random offset gives a new small sample without downloading the whole bank.
    const offset = Math.floor(Math.random() * Math.max(1, count - PREVIEW_SIZE + 1));
    const { data, error } = await client.from("published_questions")
      .select("program_slug,subject_slug,question_text,options,correct_index,explanation")
      .order("id")
      .range(offset, offset + PREVIEW_SIZE - 1);
    if (error) return [];
    return (data ?? []).flatMap((row) => {
      const subjectSlug = row.subject_slug;
      const sample = preview({
        question_text: row.question_text,
        options: row.options as string[],
        correct_index: row.correct_index,
        explanation: row.explanation,
      }, subjectSlug);
      return sample ? [sample] : [];
    });
  } catch {
    return [];
  }
}

/** Fresh questions for each homepage request, including published app uploads. */
export async function getLandingQuestions(): Promise<PreviewQuestion[]> {
  const [builtIn, published] = await Promise.all([staticSamples(), publishedSamples()]);
  const chosen = [...shuffle(published).slice(0, 3), ...shuffle(builtIn).slice(0, 2)];
  const seen = new Set(chosen.map((question) => question.question));
  for (const candidate of shuffle([...published, ...builtIn])) {
    if (chosen.length >= PREVIEW_SIZE) break;
    if (!seen.has(candidate.question)) {
      chosen.push(candidate);
      seen.add(candidate.question);
    }
  }
  return shuffle(chosen);
}
