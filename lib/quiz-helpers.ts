import { subjects } from "@/data/subjects";

export function getSubjectForUnit(unitId: string): string | undefined {
  for (const subject of subjects) {
    if (subject.units.some((u) => u.id === unitId)) {
      return subject.slug;
    }
  }
  return undefined;
}

export function getUnitName(unitId: string): string {
  for (const subject of subjects) {
    const unit = subject.units.find((u) => u.id === unitId);
    if (unit) return unit.name;
  }
  return "";
}
