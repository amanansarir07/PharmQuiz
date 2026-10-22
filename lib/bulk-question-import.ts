import { getSupabase } from "@/lib/supabase/client";

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export const MAX_IMPORT_QUESTIONS = 500;
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
  sourceId: string;
  unitNumber: number | null;
  unitName: string;
  topic: string;
  unitId: string;
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
  source_id: string | null;
  source_unit_number: number | null;
  source_unit_name: string | null;
  source_topic: string | null;
  unit_id: string | null;
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
  if (Array.isArray(value)) return value.map(tidy);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    // Accept the common past-paper shape: { "A": "...", "B": "..." }.
    // Lower-case option keys are supported as well.
    return ["A", "B", "C", "D"].map((key) => tidy(record[key] ?? record[key.toLowerCase()]));
  }
  return [];
}

function asCorrectIndex(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value !== "string") return null;
  const answer = tidy(value).toUpperCase();
  if (/^[A-D]$/.test(answer)) return answer.charCodeAt(0) - 65;
  if (/^[0-3]$/.test(answer)) return Number(answer);
  return null;
}

function asUnitNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value);
  return null;
}

function createUnitId(subjectSlug: string, unitNumber: number | null, explicitUnitId: unknown): string {
  const supplied = tidy(explicitUnitId).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (supplied) return supplied;
  return unitNumber && subjectSlug ? `${subjectSlug}-unit-${unitNumber}` : "";
}

export function validateQuestion(value: unknown, position: number, batchNormalised = new Set<string>(), existingNormalised = new Set<string>(), subjectSlug = ""): DraftQuestion {
  const record = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const sourceId = tidy(record.id ?? record.source_id ?? record.sourceId);
  const unitNumber = asUnitNumber(record.unit_number ?? record.unitNumber ?? record.source_unit_number);
  const unitName = tidy(record.unit ?? record.unitName ?? record.source_unit_name);
  const topic = tidy(record.topic ?? record.source_topic);
  const unitId = createUnitId(subjectSlug, unitNumber, record.unit_id ?? record.unitId);
  const question = tidy(record.question ?? record.question_text);
  const options = asOptions(record.options);
  const answer = record.correctAnswer ?? record.correct_index ?? record.correct_option ?? record.answer;
  const correctAnswer = asCorrectIndex(answer);
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
  if (correctAnswer === null) critical.push("A correct answer is required: A–D or zero-based 0–3.");
  else if (correctAnswer < 0 || correctAnswer > 3) critical.push("The correct answer must be A–D or an index from 0 to 3.");
  if (!explanation) warnings.push("Explanation is missing.");
  if (!DIFFICULTIES.includes(difficulty as Difficulty)) critical.push("Difficulty must be easy, medium, or hard.");
  if (normalized && batchNormalised.has(normalized)) warnings.push("Exact duplicate in this import.");
  if (normalized && existingNormalised.has(normalized)) warnings.push("Possible duplicate of an existing Bujh question.");
  if (normalized) batchNormalised.add(normalized);

  return { id: crypto.randomUUID(), position, sourceId, unitNumber, unitName, topic, unitId, question, options, correctAnswer, explanation, difficulty, tags, validation: { critical, warnings }, status: "pending", normalized };
}

export function validateBatch(raw: unknown, existingQuestions: string[] = [], subjectSlug = ""): DraftQuestion[] {
  if (!Array.isArray(raw)) throw new Error("The JSON must be an array of question objects.");
  if (raw.length === 0) throw new Error("The import contains no questions.");
  if (raw.length > MAX_IMPORT_QUESTIONS) throw new Error(`Import up to ${MAX_IMPORT_QUESTIONS} questions at a time.`);
  const seen = new Set<string>();
  const existing = new Set(existingQuestions.map(normalizeQuestion).filter(Boolean));
  const questions = raw.map((item, position) => validateQuestion(item, position, seen, existing, subjectSlug));
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
  return { id: saved.id, position: saved.position, sourceId: saved.source_id ?? "", unitNumber: saved.source_unit_number, unitName: saved.source_unit_name ?? "", topic: saved.source_topic ?? "", unitId: saved.unit_id ?? "", question: saved.question_text, options: asOptions(saved.options), correctAnswer: saved.correct_index, explanation: saved.explanation, difficulty: saved.difficulty, tags: saved.tags ?? [], validation: saved.validation ?? { critical: [], warnings: [] }, status: saved.status, normalized: saved.normalized_question };
}

export async function createQuestionImport(destination: ImportDestination, questions: DraftQuestion[]): Promise<SavedImport> {
  const client = getSupabase();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error("Sign in as an admin to save an import.");
  const { data: batch, error } = await client.from("question_imports").insert({ created_by: auth.user.id, program_slug: destination.programSlug, subject_slug: destination.subjectSlug, unit_id: destination.unitId, topic: destination.topic || null, imported_count: questions.length }).select().single();
  if (error || !batch) throw new Error(error?.message || "Could not create import batch.");
  const rows = questions.map((q) => ({ import_id: batch.id, position: q.position, source_id: q.sourceId || null, source_unit_number: q.unitNumber, source_unit_name: q.unitName || null, source_topic: q.topic || null, unit_id: q.unitId || destination.unitId, question_text: q.question, options: q.options, correct_index: q.correctAnswer, explanation: q.explanation, difficulty: q.difficulty, tags: q.tags, normalized_question: q.normalized, validation: q.validation, status: q.status }));
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
  const { error } = await getSupabase().from("question_import_items").update({ source_id: question.sourceId || null, source_unit_number: question.unitNumber, source_unit_name: question.unitName || null, source_topic: question.topic || null, unit_id: question.unitId || null, question_text: question.question, options: question.options, correct_index: question.correctAnswer, explanation: question.explanation, difficulty: question.difficulty, tags: question.tags, normalized_question: question.normalized, validation: question.validation, status: question.status, updated_at: new Date().toISOString() }).eq("id", question.id);
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

/** Subject slugs that have at least one reviewed and published import. */
export async function getPublishedSubjectSlugs(programSlug: string): Promise<string[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const { data, error } = await getSupabase()
    .from("published_questions")
    .select("subject_slug")
    .eq("program_slug", programSlug);
  if (error) return [];
  return [...new Set((data ?? []).map((row) => row.subject_slug).filter(Boolean))];
}

/** Count database-published questions without loading their full text. */
export async function getPublishedQuestionCount(programSlug: string): Promise<number> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return 0;
  const { count, error } = await getSupabase()
    .from("published_questions")
    .select("id", { count: "exact", head: true })
    .eq("program_slug", programSlug);
  return error ? 0 : count ?? 0;
}
