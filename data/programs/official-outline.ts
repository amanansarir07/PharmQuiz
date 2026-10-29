import type { SubjectData } from "@/data/types";

type Outline = {
  key: string;
  name: string;
  examMarks: number;
  totalHours: number;
  units: { name: string; hours: number }[];
};

/** Subject marks are published by CTEVT; unit marks are not. */
export function officialOutline(programSlug: string, source: string, outline: Outline[]): SubjectData[] {
  return outline.map((entry) => {
    const slug = `${programSlug}-${entry.key}`;
    return {
      id: slug,
      slug,
      name: entry.name,
      description: source,
      icon: "•",
      examMarks: entry.examMarks,
      totalHours: entry.totalHours,
      units: entry.units.map((unit, index) => ({
        id: `${slug}-unit-${index + 1}`,
        slug: unit.name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `unit-${index + 1}`,
        name: unit.name,
        description: unit.name,
        examHours: unit.hours,
        examMarks: 0,
        subtopics: [],
      })),
    };
  });
}
