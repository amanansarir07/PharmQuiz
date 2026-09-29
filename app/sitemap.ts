import type { MetadataRoute } from "next";
import { getPrograms, getSubjectsForProgram, isProgramAvailable } from "@/data/registry";
import { SITE_URL } from "@/lib/site";

/**
 * Sitemap.
 *
 * Only public pages are listed — every practice, stats and account page sits
 * behind auth, so it is excluded here and in robots.txt. Programmes without
 * content are still listed (they are the ones people search for), just with a
 * lower priority.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/programs`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/subjects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${SITE_URL}/leaderboard`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    },
  ];

  const programPages: MetadataRoute.Sitemap = getPrograms().map((program) => ({
    url: `${SITE_URL}/programs/${program.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: isProgramAvailable(program.slug) ? 0.9 : 0.4,
  }));

  const subjectPages: MetadataRoute.Sitemap = getPrograms()
    .filter((program) => isProgramAvailable(program.slug))
    .flatMap((program) =>
      getSubjectsForProgram(program.slug).map((subject) => ({
        url: `${SITE_URL}/subjects/${subject.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }))
    );

  return [...staticPages, ...programPages, ...subjectPages];
}
