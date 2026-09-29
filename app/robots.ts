import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * robots.txt.
 *
 * Practice sessions, results, stats and account pages are per-student, so they
 * are excluded — there is nothing there for a crawler but a login wall, and
 * session URLs would otherwise leak into search results.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/auth/",
          "/profile",
          "/dashboard",
          "/quiz",
          "/analytics",
          "/history",
          "/bookmarks",
          "/notes",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
