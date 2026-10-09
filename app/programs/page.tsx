import type { Metadata } from "next";
import { getProgrammeQuestionCounts } from "@/lib/quiz-loader";
import { ProgrammesScreen } from "@/components/programmes-screen";
export const metadata: Metadata = { title: "Programmes", description: "Choose a CTEVT or +2 programme and begin studying with Bujh." };
export default async function ProgramsPage() { const counts = await getProgrammeQuestionCounts(); return <ProgrammesScreen questionCounts={counts} />; }
