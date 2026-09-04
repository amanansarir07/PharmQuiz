import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Bujh",
    short_name: "Bujh",
    description:
      "Practice MCQs for D. Pharmacy 2nd year CTEVT examinations. Cover Pharmaceutics, Pharmacology, Chemistry, Pharmacognosy, Biochemistry, Microbiology, Pharmacotherapeutics, Management and Public Health Pharmacy.",
    start_url: "/",
    display: "standalone",
    background_color: "#121212",
    theme_color: "#121212",
    lang: "en",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
