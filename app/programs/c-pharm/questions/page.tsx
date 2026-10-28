import type { Metadata } from "next";
import { NpcQuestionCollection } from "@/components/npc-question-collection";

export const metadata: Metadata = {
  title: "Pharmacy Council past questions",
  description:
    "Browse the Nepal Pharmacy Council's scanned collection of pharmacist and pharmacy assistant past questions.",
};

export default function PharmacyCouncilQuestionsPage() {
  return <NpcQuestionCollection />;
}
