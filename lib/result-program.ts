"use client";

import { DEFAULT_PROGRAM_SLUG, getProgramForSubject } from "@/data/registry";

/**
 * Resolve which programme a saved quiz result belongs to.
 *
 * Results written before the programme existed carry no slug (localStorage
 * entries from older sessions, and `quiz_results` rows predating migration
 * 008). Those are resolved from the subject instead — every subject slug
 * belongs to exactly one programme, so this always lands somewhere sensible.
 * Anything genuinely unrecognised falls back to the default programme, which
 * is where it would have been filed anyway.
 */
export function resolveResultProgram(
  explicit: string | null | undefined,
  subject: string
): string {
  return (
    (explicit && explicit.trim()) ||
    getProgramForSubject(subject)?.slug ||
    DEFAULT_PROGRAM_SLUG
  );
}
