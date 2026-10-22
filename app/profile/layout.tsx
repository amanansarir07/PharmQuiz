"use client";

import { AccountRequiredState } from "@/components/account-required-state";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountRequiredState title="Your student profile" description="Create a free account to keep your profile, learning progress and study tools together.">{children}</AccountRequiredState>;
}
