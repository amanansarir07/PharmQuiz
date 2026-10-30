import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description: "Ask questions and learn with the Bujh academic community.",
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
