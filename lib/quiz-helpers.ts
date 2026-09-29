import { getSubjectOfUnit, getUnitById } from "@/data/registry";

/** Slug of the subject a unit belongs to, or undefined when unknown. */
export function getSubjectForUnit(unitId: string): string | undefined {
  return getSubjectOfUnit(unitId)?.slug;
}

/** Display name of a unit, or an empty string when unknown. */
export function getUnitName(unitId: string): string {
  return getUnitById(unitId)?.name ?? "";
}
