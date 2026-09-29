import type { FacultyData } from "@/data/types";

/**
 * The college's streams. Each groups the programmes that sit under it.
 *
 * Two streams today: the CTEVT technical programmes and the +2 (higher
 * secondary) programmes. Add a stream here, then register its programmes in
 * `data/programs.ts`.
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
    id: "stream-plus-two",
    slug: "plus-two",
    name: "+2 Programmes",
    description:
      "Higher secondary programmes preparing students for university entrance in science, computer and management streams.",
    icon: "📚",
    order: 2,
  },
];
