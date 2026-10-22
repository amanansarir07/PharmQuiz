"use client";

import { AccountRequiredState } from "@/components/account-required-state";

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountRequiredState title="Join the leaderboard" description="Create a free account to compete with students in your programme and track your rank.">{children}</AccountRequiredState>;
}
