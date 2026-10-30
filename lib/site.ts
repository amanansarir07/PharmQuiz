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

export const SITE_TAGLINE = "Learn. Practice. Understand.";
export const SITE_DESCRIPTION = "Explore CTEVT and +2 subjects on Bujh. Practise available MCQs and mock exams, review explanations, and follow your progress.";
