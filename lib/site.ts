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
export const SITE_TAGLINE =
  "MCQ practice for every CTEVT diploma and certificate programme and the +2 streams";
