import { DEFAULT_PROGRAM_SLUG } from "@/data/registry";

/**
 * A question exactly as it appears in a JSON bank.
 *
 * Two schemas exist in the published content and both must keep working:
 *
 *   unit-attributed: { unit_id,     question_text, options: string[], correct_index }
 *   legacy:          { subject,     question_text, options: { a,b,c,d }, correct_option }
 *
 * Legacy entries carry no `unit_id`, so they cannot be selected by unit and
 * only surface in whole-bank views (Review, and mock papers as filler).
 */
export interface RawBankQuestion {
  unit_id?: string;
  subject?: string;
  question_text: string;
  options: string[] | Record<string, string>;
  correct_index?: number;
  correct_option?: string;
  explanation?: string;
  difficulty?: string;
  tags?: string[];
}

type BankLoader = () => Promise<RawBankQuestion[]>;

/**
 * Lazy question-bank loaders, keyed by programme slug then subject slug.
 *
 * Every `import()` here becomes its own chunk, so a visitor downloads only the
 * subject they actually open rather than every published bank. Nothing in this
 * module is a static import — keeping it that way is what keeps the banks out
 * of the shared client bundle.
 */
const BANK_LOADERS: Record<string, Record<string, BankLoader>> = {
  "d-pharm-y2": {
    "pharmaceutics-i": () =>
      import("@/data/programs/d-pharm-y2/questions/pharmaceutics-i.json").then(
        (m) => m.default as RawBankQuestion[]
      ),
    "pharmacology-i": () =>
      import("@/data/programs/d-pharm-y2/questions/pharmacology-i.json").then(
        (m) => m.default as RawBankQuestion[]
      ),
    "pharmaceutical-chemistry-i": () =>
      import(
        "@/data/programs/d-pharm-y2/questions/pharmaceutical-chemistry-i.json"
      ).then((m) => m.default as RawBankQuestion[]),
    pharmacognosy: () =>
      import("@/data/programs/d-pharm-y2/questions/pharmacognosy.json").then(
        (m) => m.default as RawBankQuestion[]
      ),
    "biochemistry-microbiology": () =>
      import(
        "@/data/programs/d-pharm-y2/questions/biochemistry-microbiology.json"
      ).then((m) => m.default as RawBankQuestion[]),
    "pharmacotherapeutics-i": () =>
      import(
        "@/data/programs/d-pharm-y2/questions/pharmacotherapeutics-i.json"
      ).then((m) => m.default as RawBankQuestion[]),
    "pharmaceutical-management": () =>
      import(
        "@/data/programs/d-pharm-y2/questions/pharmaceutical-management.json"
      ).then((m) => m.default as RawBankQuestion[]),
    "public-health-pharmacy": () =>
      import(
        "@/data/programs/d-pharm-y2/questions/public-health-pharmacy.json"
      ).then((m) => m.default as RawBankQuestion[]),
  },
  "d-pharm-y3": {
    "d-pharm-y3-pharmaceutics-ii": () =>
      import(
        "@/data/programs/d-pharm-y3/questions/d-pharm-y3-pharmaceutics-ii.json"
      ).then((m) => m.default as RawBankQuestion[]),
  },
};

/**
 * Resolved banks, cached by `programSlug/subjectSlug`. Content is static for
 * the lifetime of the page, so caching the promise (not just the result) also
 * de-duplicates concurrent callers.
 */
const bankCache = new Map<string, Promise<RawBankQuestion[]>>();

/** Subject slugs that have a question bank for a programme. */
export function getBankSubjectSlugs(
  programSlug: string = DEFAULT_PROGRAM_SLUG
): string[] {
  return Object.keys(BANK_LOADERS[programSlug] ?? {});
}

/** Programme slugs that have any question bank wired up. */
export function getBankProgramSlugs(): string[] {
  return Object.keys(BANK_LOADERS);
}

/** True when a subject has a bank in the given programme. */
export function hasBank(
  subjectSlug: string,
  programSlug: string = DEFAULT_PROGRAM_SLUG
): boolean {
  return Boolean(BANK_LOADERS[programSlug]?.[subjectSlug]);
}

/**
 * The programme a subject's bank belongs to, falling back to the default
 * programme so older quiz configs (which only stored a subject slug) still
 * resolve.
 */
export function resolveBankProgram(subjectSlug: string): string {
  for (const programSlug of Object.keys(BANK_LOADERS)) {
    if (BANK_LOADERS[programSlug][subjectSlug]) return programSlug;
  }
  return DEFAULT_PROGRAM_SLUG;
}

/**
 * Load one subject's questions. Resolves to `[]` when the subject has no bank
 * so callers never have to guard.
 */
export async function loadBank(
  subjectSlug: string,
  programSlug: string = resolveBankProgram(subjectSlug)
): Promise<RawBankQuestion[]> {
  const loader = BANK_LOADERS[programSlug]?.[subjectSlug];
  if (!loader) return [];

  const key = `${programSlug}/${subjectSlug}`;
  let pending = bankCache.get(key);
  if (!pending) {
    pending = loader().catch((err) => {
      // Don't poison the cache with a failed load — let the next call retry.
      bankCache.delete(key);
      throw err;
    });
    bankCache.set(key, pending);
  }
  return pending;
}

/** Load every bank belonging to one programme, in syllabus order. */
export async function loadProgramBanks(
  programSlug: string = DEFAULT_PROGRAM_SLUG
): Promise<{ subjectSlug: string; questions: RawBankQuestion[] }[]> {
  const slugs = getBankSubjectSlugs(programSlug);
  return Promise.all(
    slugs.map(async (subjectSlug) => ({
      subjectSlug,
      questions: await loadBank(subjectSlug, programSlug),
    }))
  );
}

/** Load every bank across every published programme. */
export async function loadAllBanks(): Promise<
  { programSlug: string; subjectSlug: string; questions: RawBankQuestion[] }[]
> {
  const programs = getBankProgramSlugs();
  const nested = await Promise.all(
    programs.map(async (programSlug) => {
      const banks = await loadProgramBanks(programSlug);
      return banks.map((b) => ({ programSlug, ...b }));
    })
  );
  return nested.flat();
}
