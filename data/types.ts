/**
 * Content-layer types shared by every programme's curriculum data.
 *
 * Hierarchy: Stream/Faculty -> Program -> Subject -> Unit -> Subtopic -> Question.
 * The `data/programs/<program-slug>/` folders hold the actual content; the
 * registries in `data/faculties.ts` and `data/programs.ts` hold the metadata.
 */

export interface UnitData {
  id: string;
  name: string;
  slug: string;
  description: string;
  examHours: number;
  examMarks: number;
  subtopics: string[];
}

export interface SubjectData {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  examMarks: number;
  totalHours: number;
  units: UnitData[];
}

/** A stream that groups programmes, e.g. "CTEVT Programmes" or "+2 Programmes". */
export interface FacultyData {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

/**
 * A content-bearing programme: one award at one level, e.g. "D. Pharmacy · Year 2".
 *
 * This is the entity subjects hang off, because a student's syllabus is defined
 * by (award, level) — Year 2 Pharmacy has different subjects than Year 3.
 * `award` groups sibling levels so the UI can render one "Pharmacy" card with
 * Year 1 / 2 / 3 chips.
 */
export interface ProgramMeta {
  id: string;
  slug: string;
  /** `FacultyData.slug` this programme belongs to. */
  facultySlug: string;
  /** Award name shared by sibling levels, e.g. "D. Pharmacy". */
  award: string;
  /** Full programme name for headings, e.g. "D. Pharmacy". */
  name: string;
  /** Level within the award, e.g. "Year 2". Empty for single-level awards. */
  level: string;
  /** Compact label for switcher chips, e.g. "D.Pharm · Year 2". */
  shortLabel: string;
  description: string;
  icon: string;
  order: number;
  /** False while a programme is registered but its content hasn't landed yet. */
  hasContent: boolean;
}
