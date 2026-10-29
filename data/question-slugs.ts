import { getSubjectsForProgram } from "@/data/registry";

/** Accept short import slugs created before a programme's curriculum was wired in. */
export function publishedSubjectSlugs(programSlug: string, subjectSlug: string): string[] {
  const prefix = `${programSlug}-`;
  if (!subjectSlug.startsWith(prefix)) return [subjectSlug];
  const shortSlug = subjectSlug.slice(prefix.length);
  return [...new Set([
    subjectSlug,
    shortSlug,
    ...(programSlug === "health-assistant-y2" && shortSlug === "pharmacology-pharmacy"
      ? ["pharmacology-and-pharmacy"] : []),
  ])];
}

export function canonicalPublishedSubjectSlug(programSlug: string, publishedSlug: string): string {
  return getSubjectsForProgram(programSlug).find((subject) =>
    publishedSubjectSlugs(programSlug, subject.slug).includes(publishedSlug)
  )?.slug ?? publishedSlug;
}

export function canonicalPublishedUnitId(
  subjectSlug: string,
  publishedSlug: string,
  unitId: string
): string {
  if (publishedSlug === subjectSlug) return unitId;
  const prefix = `${publishedSlug}-unit-`;
  return unitId.startsWith(prefix) ? `${subjectSlug}-unit-${unitId.slice(prefix.length)}` : unitId;
}
