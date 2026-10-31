import type { Metadata } from "next";
import { PublicHomeRoute } from "@/components/public-home-route";
import { PublicLanding } from "@/components/public-landing";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/` },
};

export default function HomePage() {
  return (
    <PublicHomeRoute>
      <PublicLanding />
    </PublicHomeRoute>
  );
}
