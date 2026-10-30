import type { SubjectData } from "@/data/types";

// This is the published import destination, not a claimed transcription of
// the Nepal Pharmacy Council syllabus. Keep both IDs aligned with the existing
// c-pharm / exam / all records so they become usable without re-importing.
export const subjects: SubjectData[] = [
  {
    id: "c-pharm-exam",
    slug: "exam",
    name: "Registration exam question bank",
    description: "Practice published Pharmacy Assistant registration exam MCQs. Questions are currently grouped together while syllabus-level topic mapping is pending.",
    icon: "📘",
    examMarks: 0,
    totalHours: 0,
    units: [
      {
        id: "all",
        slug: "all",
        name: "All exam questions",
        description: "The complete published registration exam practice bank. Individual syllabus units have not been mapped yet.",
        examHours: 0,
        examMarks: 0,
        subtopics: [],
      },
    ],
  },
];
