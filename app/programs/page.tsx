import type { Metadata } from "next";
import { getProgrammeQuestionCounts } from "@/lib/quiz-loader";
import { ProgrammesScreen } from "@/components/programmes-screen";
export const metadata: Metadata = { title: "Programmes", description: "Explore CTEVT and +2 programmes or browse Pharmacy Council registration exam past questions with Bujh." };
export default async function ProgramsPage() { const counts = await getProgrammeQuestionCounts(); return <ProgrammesScreen questionCounts={counts} />; }
