"use client";

import { AccountRequiredState } from "@/components/account-required-state";

export default function MistakesLayout({ children }: { children: React.ReactNode }) {
  return <AccountRequiredState title="Learn from your mistakes" description="Create a free account to collect missed questions and practise them later. Your current quiz result still includes answer review.">{children}</AccountRequiredState>;
}
