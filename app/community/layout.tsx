import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description: "Chat and learn with students in your Bujh programme and year.",
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
