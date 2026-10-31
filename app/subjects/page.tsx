import type { Metadata } from "next";
import { SubjectsScreen } from "@/components/subjects-screen";

export const metadata: Metadata = {
  title: "Subjects",
  description: "Browse subjects and syllabus units available for study on Bujh.",
  alternates: { canonical: "/subjects" },
};

export default function SubjectsPage() {
  return <SubjectsScreen />;
}
