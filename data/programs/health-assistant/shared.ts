import type { SubjectData, UnitData } from "@/data/types";

export type UnitEntry = readonly [name: string, hours?: number];

/** CTEVT publishes subject marks, but not marks for each unit. */
export function haSubject(
  year: 2 | 3,
  name: string,
  key: string,
  examMarks: number,
  totalHours: number,
  entries: readonly UnitEntry[]
): SubjectData {
  const slug = `health-assistant-y${year}-${key}`;
  const units: UnitData[] = entries.map(([unitName, hours = 0], index) => ({
    id: `${slug}-unit-${index + 1}`,
    name: unitName,
    slug: unitName.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    description: unitName,
    examHours: hours,
    examMarks: 0,
    subtopics: [],
  }));
  return {
    id: slug,
    slug,
    name,
    description: `CTEVT PCL in General Medicine (HA), Year ${year} curriculum.`,
    icon: "•",
    examMarks,
    totalHours,
    units,
  };
}
