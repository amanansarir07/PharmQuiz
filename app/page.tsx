import { PublicHomeRoute } from "@/components/public-home-route";
import { PublicLanding } from "@/components/public-landing";

export default function HomePage() {
  return (
    <PublicHomeRoute>
      <PublicLanding />
    </PublicHomeRoute>
  );
}
