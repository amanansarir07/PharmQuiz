import type { Metadata } from "next";
import { getProgrammeQuestionCounts } from "@/lib/quiz-loader";
import { ProgrammesScreen } from "@/components/programmes-screen";
export const metadata: Metadata = {
  title: "Programmes",
  description: "Explore CTEVT, +2, and Pharmacy Council exam preparation programmes with Bujh.",
  alternates: { canonical: "/programs" },
};
export default async function ProgramsPage() { const counts = await getProgrammeQuestionCounts(); return <ProgrammesScreen questionCounts={counts} />; }
