import { getSupabase } from "@/lib/supabase/client";

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];
export type ImportStatus = "pending" | "approved" | "rejected";

export type ImportDestination = {
  programSlug: string;
  subjectSlug: string;
  unitId: string;
  topic: string;
};

export type Validation = { critical: string[]; warnings: string[] };
export type DraftQuestion = {
  id: string;
  position: number;
  question: string;
  options: string[];
  correctAnswer: number | null;
  explanation: string;
  difficulty: string;
  tags: string[];
  validation: Validation;
  status: ImportStatus;
  normalized: string;
};

export type SavedImport = {
  id: string;
  program_slug: string;
  subject_slug: string;
  unit_id: string;
  topic: string | null;
  imported_count: number;
  published_count: number;
  rejected_count: number;
  status: "draft" | "published";
  created_at: string;
  published_at: string | null;
};

export type SavedImportItem = {
  id: string;
  import_id: string;
  position: number;
  question_text: string;
  options: unknown;
  correct_index: number | null;
  explanation: string;
  difficulty: string;
  tags: string[] | null;
  validation: Validation;
  status: ImportStatus;
  normalized_question: string;
};

export type PublishedQuestion = {
  id: string;
  unit_id: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: string;
  tags: string[];
};

const tidy = (value: unknown) => typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
export const normalizeQuestion = (question: string) => tidy(question).toLowerCase().replace(/[\W_]+/g, " ").trim();

function asOptions(value: unknown): string[] {
  return Array.isArray(value) ? value.map(tidy) : [];
}

export function validateQuestion(value: unknown, position: number, batchNormalised = new Set<string>(), existingNormalised = new Set<string>()): DraftQuestion {
  const record = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const question = tidy(record.question ?? record.question_text);
  const options = asOptions(record.options);
  const answer = record.correctAnswer ?? record.correct_index;
  const correctAnswer = typeof answer === "number" && Number.isInteger(answer) ? answer : null;
  const explanation = tidy(record.explanation);
  const difficulty = tidy(record.difficulty).toLowerCase() || "medium";
  const tags = Array.isArray(record.tags) ? record.tags.map(tidy).filter(Boolean).slice(0, 12) : [];
  const critical: string[] = [];
  const warnings: string[] = [];
  const normalized = normalizeQuestion(question);

  if (!question) critical.push("Question text is required.");
  else if (question.length < 12) critical.push("Question text is too short.");
  if (options.length !== 4) critical.push("Exactly four options are required.");
  if (options.some((option) => !option)) critical.push("Every option needs text.");
  if (new Set(options.map((option) => option.toLowerCase())).size !== options.length) critical.push("Options must be distinct.");
  if (correctAnswer === null) critical.push("A zero-based correctAnswer is required.");
  else if (correctAnswer < 0 || correctAnswer > 3) critical.push("correctAnswer must be an index from 0 to 3.");
  if (!explanation) warnings.push("Explanation is missing.");
  if (!DIFFICULTIES.includes(difficulty as Difficulty)) critical.push("Difficulty must be easy, medium, or hard.");
  if (normalized && batchNormalised.has(normalized)) warnings.push("Exact duplicate in this import.");
  if (normalized && existingNormalised.has(normalized)) warnings.push("Possible duplicate of an existing Bujh question.");
  if (normalized) batchNormalised.add(normalized);

  return { id: crypto.randomUUID(), position, question, options, correctAnswer, explanation, difficulty, tags, validation: { critical, warnings }, status: "pending", normalized };
}

export function validateBatch(raw: unknown, existingQuestions: string[] = []): DraftQuestion[] {
  if (!Array.isArray(raw)) throw new Error("The JSON must be an array of question objects.");
  if (raw.length === 0) throw new Error("The import contains no questions.");
  if (raw.length > 100) throw new Error("Import up to 100 questions at a time.");
  const seen = new Set<string>();
  const existing = new Set(existingQuestions.map(normalizeQuestion).filter(Boolean));
  const questions = raw.map((item, position) => validateQuestion(item, position, seen, existing));
  const existingNormalised = existingQuestions.map(normalizeQuestion).filter(Boolean);
  for (const question of questions) {
    if (!question.normalized) continue;
    const otherImport = questions.some((other) => other.id !== question.id && textSimilarity(question.normalized, other.normalized) >= 0.84);
    const existingMatch = existingNormalised.some((other) => textSimilarity(question.normalized, other) >= 0.84);
    if ((otherImport || existingMatch) && !question.validation.warnings.some((warning) => warning.includes("Possible duplicate"))) {
      question.validation.warnings.push(otherImport ? "Possible near-duplicate in this import." : "Possible near-duplicate of an existing Bujh question.");
    }
  }
  return questions;
}

function textSimilarity(left: string, right: string): number {
  if (!left || !right) return 0;
  const a = new Set(left.split(" ").filter((word) => word.length > 2));
  const b = new Set(right.split(" ").filter((word) => word.length > 2));
  let common = 0;
  a.forEach((word) => { if (b.has(word)) common += 1; });
  return common / Math.max(1, a.size + b.size - common);
}

export function reviewState(question: DraftQuestion): "ready" | "review" | "invalid" {
  if (question.validation.critical.length) return "invalid";
  if (question.validation.warnings.length) return "review";
  return "ready";
}

export function toDraft(saved: SavedImportItem): DraftQuestion {
  return { id: saved.id, position: saved.position, question: saved.question_text, options: asOptions(saved.options), correctAnswer: saved.correct_index, explanation: saved.explanation, difficulty: saved.difficulty, tags: saved.tags ?? [], validation: saved.validation ?? { critical: [], warnings: [] }, status: saved.status, normalized: saved.normalized_question };
}

export async function createQuestionImport(destination: ImportDestination, questions: DraftQuestion[]): Promise<SavedImport> {
  const client = getSupabase();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error("Sign in as an admin to save an import.");
  const { data: batch, error } = await client.from("question_imports").insert({ created_by: auth.user.id, program_slug: destination.programSlug, subject_slug: destination.subjectSlug, unit_id: destination.unitId, topic: destination.topic || null, imported_count: questions.length }).select().single();
  if (error || !batch) throw new Error(error?.message || "Could not create import batch.");
  const rows = questions.map((q) => ({ import_id: batch.id, position: q.position, question_text: q.question, options: q.options, correct_index: q.correctAnswer, explanation: q.explanation, difficulty: q.difficulty, tags: q.tags, normalized_question: q.normalized, validation: q.validation, status: q.status }));
  const { error: itemError } = await client.from("question_import_items").insert(rows);
  if (itemError) {
    await client.from("question_imports").delete().eq("id", batch.id);
    throw new Error(itemError.message);
  }
  return batch as SavedImport;
}

export async function getQuestionImports(): Promise<SavedImport[]> {
  const { data, error } = await getSupabase().from("question_imports").select("*").order("created_at", { ascending: false }).limit(30);
  if (error) throw new Error(error.message);
  return (data ?? []) as SavedImport[];
}

export async function getQuestionImportItems(importId: string): Promise<DraftQuestion[]> {
  const { data, error } = await getSupabase().from("question_import_items").select("*").eq("import_id", importId).order("position");
  if (error) throw new Error(error.message);
  return ((data ?? []) as SavedImportItem[]).map(toDraft);
}

export async function updateQuestionImportItem(question: DraftQuestion): Promise<void> {
  const { error } = await getSupabase().from("question_import_items").update({ question_text: question.question, options: question.options, correct_index: question.correctAnswer, explanation: question.explanation, difficulty: question.difficulty, tags: question.tags, normalized_question: question.normalized, validation: question.validation, status: question.status, updated_at: new Date().toISOString() }).eq("id", question.id);
  if (error) throw new Error(error.message);
}

export async function publishQuestionImport(importId: string): Promise<{ inserted: number; skipped: number }> {
  const { data, error } = await getSupabase().rpc("publish_question_import", { p_import_id: importId });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return { inserted: Number(row?.inserted_count ?? 0), skipped: Number(row?.skipped_count ?? 0) };
}

export async function getPublishedQuestions(programSlug: string, subjectSlug: string): Promise<PublishedQuestion[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const { data, error } = await getSupabase().from("published_questions").select("id,unit_id,question_text,options,correct_index,explanation,difficulty,tags").eq("program_slug", programSlug).eq("subject_slug", subjectSlug);
  if (error) return [];
  return (data ?? []).map((row) => ({ ...row, options: asOptions(row.options), tags: row.tags ?? [] })) as PublishedQuestion[];
}
