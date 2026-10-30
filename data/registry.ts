import { faculties } from "@/data/faculties";
import { DEFAULT_PROGRAM_SLUG, programs } from "@/data/programs";
import { subjects as dPharmYear1Subjects } from "@/data/programs/d-pharm-y1/subjects";
import { subjects as dPharmYear2Subjects } from "@/data/programs/d-pharm-y2/subjects";
import { subjects as dPharmYear3Subjects } from "@/data/programs/d-pharm-y3/subjects";
import { subjects as cPharmSubjects } from "@/data/programs/c-pharm/subjects";
import { subjects as healthAssistantYear2Subjects } from "@/data/programs/health-assistant/year-2";
import { subjects as healthAssistantYear3Subjects } from "@/data/programs/health-assistant/year-3";
import { officialOutline } from "@/data/programs/official-outline";
import { scienceBiologySubjects, computerScienceSubjects, managementSubjects } from "@/data/programs/plus-two/subjects";
import nursingYear1 from "@/data/programs/pcl-nursing/year-1.json";
import nursingYear2 from "@/data/programs/pcl-nursing/year-2.json";
import nursingYear3 from "@/data/programs/pcl-nursing/year-3.json";
import physiotherapyYear2 from "@/data/programs/d-physiotherapy/year-2.json";
import physiotherapyYear3 from "@/data/programs/d-physiotherapy/year-3.json";
import cmltYear2 from "@/data/programs/cmlt/year-2.json";
import cmltYear3 from "@/data/programs/cmlt/year-3.json";
import type { ProgramMeta, SubjectData, UnitData } from "@/data/types";

export { faculties } from "@/data/faculties";
export { DEFAULT_PROGRAM_SLUG, programs } from "@/data/programs";
export type { FacultyData, ProgramMeta, SubjectData, UnitData } from "@/data/types";

/**
 * Programme slug -> that programme's subject list.
 *
 * Only programmes with `hasContent: true` appear here. Everything else in the
 * catalogue renders as "coming soon" and contributes no subjects.
 */
const CONTENT_BY_PROGRAM: Record<string, SubjectData[]> = {
  "d-pharm-y1": dPharmYear1Subjects,
  "d-pharm-y2": dPharmYear2Subjects,
  "d-pharm-y3": dPharmYear3Subjects,
  "c-pharm": cPharmSubjects,
  "health-assistant-y2": healthAssistantYear2Subjects,
  "health-assistant-y3": healthAssistantYear3Subjects,
  "pcl-nursing": officialOutline("pcl-nursing", "CTEVT PCL Nursing, revised 2018, Year 1.", nursingYear1),
  "pcl-nursing-y2": officialOutline("pcl-nursing-y2", "CTEVT PCL Nursing, revised 2018, Year 2.", nursingYear2),
  "pcl-nursing-y3": officialOutline("pcl-nursing-y3", "CTEVT PCL Nursing, revised 2018, Year 3.", nursingYear3),
  "d-physiotherapy-y2": officialOutline("d-physiotherapy-y2", "CTEVT Physiotherapy, revised 2025, Year 2.", physiotherapyYear2),
  "d-physiotherapy-y3": officialOutline("d-physiotherapy-y3", "CTEVT Physiotherapy, revised 2025, Year 3.", physiotherapyYear3),
  "cmlt-y2": officialOutline("cmlt-y2", "CTEVT CMLT, revised 2024, Year 2.", cmltYear2),
  "cmlt-y3": officialOutline("cmlt-y3", "CTEVT CMLT, revised 2024, Year 3.", cmltYear3),
  "plus-two-science-bio": scienceBiologySubjects,
  "plus-two-computer": computerScienceSubjects,
  "plus-two-management": managementSubjects,
};

/** Every subject across every programme that has content, in catalogue order. */
const ALL_SUBJECTS: SubjectData[] = [...new Set(
  programs.map((program) => program.contentSourceSlug ?? program.slug)
)].flatMap((programSlug) => CONTENT_BY_PROGRAM[programSlug] ?? []);

// ----------------------------------------------------------------- faculties

export function getPrograms(): ProgramMeta[] {
  return programs;
}

export function getProgram(slug: string): ProgramMeta | undefined {
  return programs.find((p) => p.slug === slug);
}

/** The canonical curriculum and question bank used by a programme. */
export function getContentSourceProgramSlug(programSlug: string): string {
  return getProgram(programSlug)?.contentSourceSlug ?? programSlug;
}

/** Programmes that receive content from the same shared source. */
export function getContentRecipients(programSlug: string): ProgramMeta[] {
  const source = getContentSourceProgramSlug(programSlug);
  return programs.filter(
    (program) => program.hasContent && getContentSourceProgramSlug(program.slug) === source
  );
}

export function getFaculty(slug: string) {
  return faculties.find((f) => f.slug === slug);
}

export function getFacultyForProgram(programSlug: string) {
  const program = getProgram(programSlug);
  return program ? getFaculty(program.facultySlug) : undefined;
}

/** Programmes belonging to a faculty, in catalogue order. */
export function getProgramsForFaculty(facultySlug: string): ProgramMeta[] {
  return programs.filter((p) => p.facultySlug === facultySlug);
}

/** True when a programme's curriculum has actually been published. */
export function isProgramAvailable(programSlug: string): boolean {
  return CONTENT_BY_PROGRAM[getContentSourceProgramSlug(programSlug)] !== undefined;
}

/**
 * Programmes of a faculty grouped by award, so the UI can render one
 * "D. Pharmacy" heading with Year 1 / 2 / 3 chips rather than three
 * near-identical cards.
 */
export function getAwardsForFaculty(facultySlug: string) {
  const awards = new Map<string, ProgramMeta[]>();
  for (const program of getProgramsForFaculty(facultySlug)) {
    const list = awards.get(program.award) ?? [];
    list.push(program);
    awards.set(program.award, list);
  }
  return [...awards.entries()].map(([award, grouped]) => ({
    award,
    icon: grouped[0]?.icon ?? "📘",
    programs: [...grouped].sort((a, b) => a.order - b.order),
    availableCount: grouped.filter((p) => isProgramAvailable(p.slug)).length,
  }));
}

/** Streams paired with their awards and programmes — the shape `/programs` renders. */
export function getFacultyCatalogue() {
  return [...faculties]
    .sort((a, b) => a.order - b.order)
    .map((faculty) => {
      const awards = getAwardsForFaculty(faculty.slug);
      return {
        faculty,
        awards,
        programs: getProgramsForFaculty(faculty.slug).sort(
          (a, b) => a.order - b.order
        ),
        availableCount: awards.reduce((n, a) => n + a.availableCount, 0),
      };
    });
}

// ------------------------------------------------------------------ subjects

/**
 * Subjects for a programme. Defaults to the app's single published programme
 * so callers that predate multi-programme support keep working unchanged.
 */
export function getSubjectsForProgram(
  programSlug: string = DEFAULT_PROGRAM_SLUG
): SubjectData[] {
  return CONTENT_BY_PROGRAM[getContentSourceProgramSlug(programSlug)] ?? [];
}

/** Every subject across all published programmes. */
export function getAllSubjects(): SubjectData[] {
  return ALL_SUBJECTS;
}

/**
 * Look up a subject by its slug across all published programmes.
 *
 * Subject slugs are globally unique by convention: the original D.Pharm Year 2
 * slugs stay exactly as they were (students' saved results and analytics rows
 * reference them), and every future programme prefixes its slugs with its own
 * programme slug to avoid collisions.
 */
export function getSubjectBySlug(slug: string): SubjectData | undefined {
  return ALL_SUBJECTS.find((s) => s.slug === slug);
}

/** The programme a subject belongs to, when it has been published. */
export function getProgramForSubject(slug: string): ProgramMeta | undefined {
  const program = programs.find((p) =>
    getSubjectsForProgram(p.slug).some((s) => s.slug === slug)
  );
  return program;
}

/** Display name for a subject slug; falls back to the slug when unknown. */
export function getSubjectName(slug: string): string {
  return getSubjectBySlug(slug)?.name ?? slug;
}

/**
 * Full display label for a programme, e.g. "D. Pharmacy · Year 2".
 * Single-level awards have no level, so they collapse to just the name.
 */
export function getProgramLabel(programSlug: string): string {
  const program = getProgram(programSlug);
  if (!program) return programSlug;
  return program.level ? `${program.name} · ${program.level}` : program.name;
}

/**
 * Short uppercase label for share cards and chips, e.g.
 * "D.PHARM · YEAR 2 • CTEVT". The stream is spelled out because a shared
 * score card is read out of context, where "D.Pharm" alone doesn't tell a
 * reader whether it's the CTEVT diploma or a university course.
 */
export function getProgramCardLabel(programSlug: string): string {
  const program = getProgram(programSlug);
  if (!program) return DEFAULT_PROGRAM_SLUG.toUpperCase();
  const stream = getFaculty(program.facultySlug)?.name ?? program.facultySlug;
  // "CTEVT Programmes" → "CTEVT", "+2 Programmes" → "+2".
  const shortStream = stream.replace(/\s*programmes?$/i, "").toUpperCase();
  return `${program.shortLabel.toUpperCase()} • ${shortStream}`;
}

// --------------------------------------------------------------- units/totals

export function getUnitById(unitId: string): UnitData | undefined {
  for (const subject of ALL_SUBJECTS) {
    const unit = subject.units.find((u) => u.id === unitId);
    if (unit) return unit;
  }
  return undefined;
}

/** The subject a unit belongs to. */
export function getSubjectOfUnit(unitId: string): SubjectData | undefined {
  return ALL_SUBJECTS.find((s) => s.units.some((u) => u.id === unitId));
}

/** Roll-up counts for a programme, used by programme cards and headers. */
export function getProgramTotals(programSlug: string = DEFAULT_PROGRAM_SLUG) {
  const subjects = getSubjectsForProgram(programSlug);
  return {
    subjects: subjects.length,
    units: getTotalUnits(programSlug),
    subtopics: getTotalSubtopics(programSlug),
    examMarks: subjects.reduce((acc, s) => acc + s.examMarks, 0),
    totalHours: subjects.reduce((acc, s) => acc + s.totalHours, 0),
  };
}

export function getTotalUnits(
  programSlug: string = DEFAULT_PROGRAM_SLUG
): number {
  return getSubjectsForProgram(programSlug).reduce(
    (acc, s) => acc + s.units.length,
    0
  );
}

export function getTotalSubtopics(
  programSlug: string = DEFAULT_PROGRAM_SLUG
): number {
  return getSubjectsForProgram(programSlug).reduce(
    (acc, s) => acc + s.units.reduce((uAcc, u) => uAcc + u.subtopics.length, 0),
    0
  );
}
