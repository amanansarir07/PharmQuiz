"use client";

import { AccountRequiredState } from "@/components/account-required-state";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountRequiredState title="Keep your study notes" description="Sign in to create notes and sync them across your devices.">{children}</AccountRequiredState>;
}
