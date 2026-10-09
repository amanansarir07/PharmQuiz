"use client";

import { AccountRequiredState } from "@/components/account-required-state";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountRequiredState title="Track your progress" description="Create a free account to see your accuracy, weak subjects, quiz history and study streak across devices.">{children}</AccountRequiredState>;
}
