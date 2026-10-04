import type { ProgramMeta } from "@/data/types";

/**
 * The programme the app falls back to when nothing else is known: today's
 * only published curriculum. Existing quiz results, bookmarks and analytics
 * rows all reference this programme's subject slugs, so it must stay stable.
 */
export const DEFAULT_PROGRAM_SLUG = "d-pharm-y2";

/**
 * Every programme the college offers, grouped by stream (see `data/faculties.ts`).
 *
 * `hasContent: true` means `data/programs/<slug>/subjects.ts` exists and is
 * wired into `data/registry.ts`. Programmes flagged `false` are scaffolding —
 * navigation shows them as "coming soon" and they render no subjects.
 *
 * To publish a new programme:
 *   1. Create `data/programs/<slug>/subjects.ts` (+ `questions/*.json`).
 *      Prefix its subject slugs with the programme slug to keep them unique.
 *   2. Flip `hasContent` to true here.
 *   3. Register it in `CONTENT_BY_PROGRAM` in `data/registry.ts`.
 */
export const programs: ProgramMeta[] = [
  // ------------------------------------------------- CTEVT · Pharmacy (3 yrs)
  {
    id: "program-d-pharm-y1",
    slug: "d-pharm-y1",
    facultySlug: "ctevt",
    award: "D. Pharmacy",
    name: "D. Pharmacy",
    level: "Year 1",
    shortLabel: "D.Pharm · Year 1",
    description:
      "First-year diploma pharmacy curriculum covering basic sciences and the foundations of pharmaceutical practice.",
    icon: "💊",
    order: 1,
    hasContent: false,
  },
  {
    id: "program-d-pharm-y2",
    slug: "d-pharm-y2",
    facultySlug: "ctevt",
    award: "D. Pharmacy",
    name: "D. Pharmacy",
    level: "Year 2",
    shortLabel: "D.Pharm · Year 2",
    description:
      "Second-year diploma pharmacy curriculum — pharmaceutics, pharmacology, pharmaceutical chemistry, pharmacognosy, biochemistry and microbiology, pharmacotherapeutics, management and public health.",
    icon: "💊",
    order: 2,
    hasContent: true,
  },
  {
    id: "program-d-pharm-y3",
    slug: "d-pharm-y3",
    facultySlug: "ctevt",
    award: "D. Pharmacy",
    name: "D. Pharmacy",
    level: "Year 3",
    shortLabel: "D.Pharm · Year 3",
    description:
      "Third-year diploma pharmacy curriculum with clinical pharmacy practice and hospital training.",
    icon: "💊",
    order: 3,
    hasContent: true,
  },
  {
    id: "program-c-pharm",
    slug: "c-pharm",
    facultySlug: "ctevt",
    award: "Certificate in Pharmacy",
    name: "Certificate in Pharmacy",
    level: "Year 1",
    shortLabel: "C.Pharm · Year 1",
    description:
      "Certificate-level pharmacy assistant programme covering dispensing, drug store management and basic pharmacology.",
    icon: "🧪",
    order: 4,
    hasContent: false,
  },
  {
    id: "program-c-pharm-y2",
    slug: "c-pharm-y2",
    facultySlug: "ctevt",
    award: "Certificate in Pharmacy",
    name: "Certificate in Pharmacy",
    level: "Year 2",
    shortLabel: "C.Pharm · Year 2",
    description:
      "Certificate-level pharmacy assistant programme covering dispensing, drug store management and basic pharmacology.",
    icon: "🧪",
    order: 5,
    hasContent: false,
  },
  {
    id: "program-c-pharm-y3",
    slug: "c-pharm-y3",
    facultySlug: "ctevt",
    award: "Certificate in Pharmacy",
    name: "Certificate in Pharmacy",
    level: "Year 3",
    shortLabel: "C.Pharm · Year 3",
    description:
      "Certificate-level pharmacy assistant programme covering dispensing, drug store management and basic pharmacology.",
    icon: "🧪",
    order: 6,
    hasContent: false,
  },

  // --------------------------------------------------- CTEVT · other awards
  {
    id: "program-pcl-nursing",
    slug: "pcl-nursing",
    facultySlug: "ctevt",
    award: "PCL Nursing",
    name: "PCL Nursing",
    level: "Year 1",
    shortLabel: "PCL Nursing · Year 1",
    description:
      "Proficiency certificate nursing programme covering anatomy, physiology, fundamentals of nursing, medical-surgical nursing, midwifery and community health.",
    icon: "🩺",
    order: 7,
    hasContent: false,
  },
  {
    id: "program-pcl-nursing-y2",
    slug: "pcl-nursing-y2",
    facultySlug: "ctevt",
    award: "PCL Nursing",
    name: "PCL Nursing",
    level: "Year 2",
    shortLabel: "PCL Nursing · Year 2",
    description:
      "Proficiency certificate nursing programme covering anatomy, physiology, fundamentals of nursing, medical-surgical nursing, midwifery and community health.",
    icon: "🩺",
    order: 8,
    hasContent: false,
  },
  {
    id: "program-pcl-nursing-y3",
    slug: "pcl-nursing-y3",
    facultySlug: "ctevt",
    award: "PCL Nursing",
    name: "PCL Nursing",
    level: "Year 3",
    shortLabel: "PCL Nursing · Year 3",
    description:
      "Proficiency certificate nursing programme covering anatomy, physiology, fundamentals of nursing, medical-surgical nursing, midwifery and community health.",
    icon: "🩺",
    order: 9,
    hasContent: false,
  },
  {
    id: "program-health-assistant",
    slug: "health-assistant",
    facultySlug: "ctevt",
    award: "Health Assistant (HA)",
    name: "Certificate in Health Assistant",
    level: "Year 1",
    shortLabel: "HA · Year 1",
    description:
      "Health assistant programme covering primary health care, health promotion, epidemiology, and basic clinical and diagnostic services.",
    icon: "🌍",
    order: 10,
    hasContent: false,
  },
  {
    id: "program-health-assistant-y2",
    slug: "health-assistant-y2",
    facultySlug: "ctevt",
    award: "Health Assistant (HA)",
    name: "Certificate in Health Assistant",
    level: "Year 2",
    shortLabel: "HA · Year 2",
    description:
      "Health assistant programme covering primary health care, health promotion, epidemiology, and basic clinical and diagnostic services.",
    icon: "🌍",
    order: 11,
    hasContent: false,
  },
  {
    id: "program-health-assistant-y3",
    slug: "health-assistant-y3",
    facultySlug: "ctevt",
    award: "Health Assistant (HA)",
    name: "Certificate in Health Assistant",
    level: "Year 3",
    shortLabel: "HA · Year 3",
    description:
      "Health assistant programme covering primary health care, health promotion, epidemiology, and basic clinical and diagnostic services.",
    icon: "🌍",
    order: 12,
    hasContent: false,
  },
  {
    id: "program-d-physiotherapy",
    slug: "d-physiotherapy",
    facultySlug: "ctevt",
    award: "Physiotherapy",
    name: "Diploma in Physiotherapy",
    level: "Year 1",
    shortLabel: "D. Physiotherapy · Year 1",
    description:
      "Physiotherapy diploma covering anatomy, kinesiology, electrotherapy, exercise therapy and musculoskeletal rehabilitation.",
    icon: "🦴",
    order: 13,
    hasContent: false,
  },
  {
    id: "program-d-physiotherapy-y2",
    slug: "d-physiotherapy-y2",
    facultySlug: "ctevt",
    award: "Physiotherapy",
    name: "Diploma in Physiotherapy",
    level: "Year 2",
    shortLabel: "D. Physiotherapy · Year 2",
    description:
      "Physiotherapy diploma covering anatomy, kinesiology, electrotherapy, exercise therapy and musculoskeletal rehabilitation.",
    icon: "🦴",
    order: 14,
    hasContent: false,
  },
  {
    id: "program-d-physiotherapy-y3",
    slug: "d-physiotherapy-y3",
    facultySlug: "ctevt",
    award: "Physiotherapy",
    name: "Diploma in Physiotherapy",
    level: "Year 3",
    shortLabel: "D. Physiotherapy · Year 3",
    description:
      "Physiotherapy diploma covering anatomy, kinesiology, electrotherapy, exercise therapy and musculoskeletal rehabilitation.",
    icon: "🦴",
    order: 15,
    hasContent: false,
  },
  {
    id: "program-cmlt",
    slug: "cmlt",
    facultySlug: "ctevt",
    award: "Medical Laboratory Technology",
    name: "Certificate in Medical Laboratory Technology",
    level: "Year 1",
    shortLabel: "CMLT · Year 1",
    description:
      "Medical laboratory technology programme covering specimen collection, haematology, microbiology, clinical biochemistry and laboratory quality control.",
    icon: "🔬",
    order: 16,
    hasContent: false,
  },
  {
    id: "program-cmlt-y2",
    slug: "cmlt-y2",
    facultySlug: "ctevt",
    award: "Medical Laboratory Technology",
    name: "Certificate in Medical Laboratory Technology",
    level: "Year 2",
    shortLabel: "CMLT · Year 2",
    description:
      "Medical laboratory technology programme covering specimen collection, haematology, microbiology, clinical biochemistry and laboratory quality control.",
    icon: "🔬",
    order: 17,
    hasContent: false,
  },
  {
    id: "program-cmlt-y3",
    slug: "cmlt-y3",
    facultySlug: "ctevt",
    award: "Medical Laboratory Technology",
    name: "Certificate in Medical Laboratory Technology",
    level: "Year 3",
    shortLabel: "CMLT · Year 3",
    description:
      "Medical laboratory technology programme covering specimen collection, haematology, microbiology, clinical biochemistry and laboratory quality control.",
    icon: "🔬",
    order: 18,
    hasContent: false,
  },

  // ------------------------------------------------------------------ +2
  {
    id: "program-plus-two-science-bio",
    slug: "plus-two-science-bio",
    facultySlug: "plus-two",
    award: "+2 Science",
    name: "+2 Science (Biology)",
    level: "",
    shortLabel: "+2 Science (Bio)",
    description:
      "Higher secondary science stream with biology — the standard route into nursing, pharmacy, and other health-science degrees.",
    icon: "🧬",
    order: 1,
    hasContent: false,
  },
  {
    id: "program-plus-two-computer",
    slug: "plus-two-computer",
    facultySlug: "plus-two",
    award: "+2 Computer Science",
    name: "+2 Computer Science",
    level: "",
    shortLabel: "+2 Computer",
    description:
      "Higher secondary computer science stream covering programming fundamentals, computer architecture and applied mathematics.",
    icon: "💻",
    order: 2,
    hasContent: false,
  },
  {
    id: "program-plus-two-management",
    slug: "plus-two-management",
    facultySlug: "plus-two",
    award: "+2 Management",
    name: "+2 Management",
    level: "",
    shortLabel: "+2 Management",
    description:
      "Higher secondary management stream covering accountancy, economics, business studies and office management.",
    icon: "📊",
    order: 3,
    hasContent: false,
  },
];
