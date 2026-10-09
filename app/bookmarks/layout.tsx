"use client";

import { AccountRequiredState } from "@/components/account-required-state";

export default function BookmarksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountRequiredState title="Save questions for later" description="Create a free account to keep your saved questions and revisit them when you study.">{children}</AccountRequiredState>;
}
