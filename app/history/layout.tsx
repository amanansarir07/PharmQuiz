"use client";

import { AccountRequiredState } from "@/components/account-required-state";

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountRequiredState title="Your quiz history" description="Create a free account to keep a lasting record of your practice and review past results.">{children}</AccountRequiredState>;
}
