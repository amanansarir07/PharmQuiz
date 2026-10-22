import { programs } from "@/data/programs";

/**
 * Canonical site URL.
 *
 * `metadataBase`, the sitemap and robots.txt all need an absolute origin.
 * Set `NEXT_PUBLIC_SITE_URL` in the hosting environment; the fallback matches
 * the origin the share dialog already advertises.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bujh.app"
).replace(/\/$/, "");

/** Wordmark and one-line promise, shared by metadata, OG tags and the manifest. */
const liveProgrammes = programs.filter((program) => program.hasContent);
const liveNames = liveProgrammes.map((program) => program.shortLabel.replace(" · ", " ")).join(" and ");

export const SITE_TAGLINE = "Learn. Practice. Understand.";
export const SITE_DESCRIPTION = `Bujh is an MCQ practice, mock exam and revision platform for students in Nepal. ${liveNames} are available now, with more CTEVT and +2 programmes coming soon.`;
