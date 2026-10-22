import type { FacultyData } from "@/data/types";

/**
 * The college's streams. Each groups the programmes that sit under it.
 *
 * CTEVT and +2 curricula are separate from professional registration exams.
 */
export const faculties: FacultyData[] = [
  {
    id: "stream-ctevt",
    slug: "ctevt",
    name: "CTEVT Programmes",
    description:
      "Technical and vocational health-science programmes affiliated to CTEVT — diploma and certificate level.",
    icon: "🎓",
    order: 1,
  },
  {
    id: "stream-npc",
    slug: "npc",
    name: "Pharmacy Council Exam",
    description:
      "Post-diploma registration exam preparation for pharmacy assistants, administered by the Nepal Pharmacy Council.",
    icon: "🪪",
    order: 2,
  },
  {
    id: "stream-plus-two",
    slug: "plus-two",
    name: "+2 Programmes",
    description:
      "Higher secondary programmes preparing students for university entrance in science, computer and management streams.",
    icon: "📚",
    order: 3,
  },
];
