/**
 * Canonical site URL.
 *
 * `metadataBase`, the sitemap and robots.txt all need an absolute origin.
 * Set `NEXT_PUBLIC_SITE_URL` in the hosting environment; the fallback matches
 * the origin the share dialog already advertises.
 */
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bujh.app";
const siteUrl = new URL(configuredSiteUrl);

// The public hostname redirects to www; keep sitemap, robots and metadata
// URLs on the final 200-response origin to avoid publishing redirect URLs.
if (siteUrl.hostname === "bujh.app") siteUrl.hostname = "www.bujh.app";

export const SITE_URL = siteUrl.toString().replace(/\/$/, "");

export const SITE_TAGLINE = "Learn. Practice. Understand.";
export const SITE_DESCRIPTION = "Explore CTEVT and +2 subjects on Bujh. Practise available MCQs and mock exams, review explanations, and follow your progress.";
