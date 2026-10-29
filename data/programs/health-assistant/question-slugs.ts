import { getSubjectsForProgram } from "@/data/registry";

/** Imports created before the HA curriculum was registered used short slugs. */
export function publishedSubjectSlugs(programSlug: string, subjectSlug: string): string[] {
  const prefix = `${programSlug}-`;
  if (!/^health-assistant-y[23]$/.test(programSlug) || !subjectSlug.startsWith(prefix)) {
    return [subjectSlug];
  }
  const shortSlug = subjectSlug.slice(prefix.length);
  return [...new Set([
    subjectSlug,
    shortSlug,
    ...(shortSlug === "pharmacology-pharmacy" ? ["pharmacology-and-pharmacy"] : []),
  ])];
}

export function canonicalPublishedSubjectSlug(programSlug: string, publishedSlug: string): string {
  if (!/^health-assistant-y[23]$/.test(programSlug)) return publishedSlug;
  return getSubjectsForProgram(programSlug).find((subject) =>
    publishedSubjectSlugs(programSlug, subject.slug).includes(publishedSlug)
  )?.slug ?? publishedSlug;
}

export function canonicalPublishedUnitId(
  programSlug: string,
  subjectSlug: string,
  publishedSlug: string,
  unitId: string
): string {
  if (!/^health-assistant-y[23]$/.test(programSlug) || publishedSlug === subjectSlug) return unitId;
  const prefix = `${publishedSlug}-unit-`;
  return unitId.startsWith(prefix) ? `${subjectSlug}-unit-${unitId.slice(prefix.length)}` : unitId;
}
