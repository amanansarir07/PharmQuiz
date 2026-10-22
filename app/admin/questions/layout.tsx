"use client";

import { AuthGuard } from "@/components/auth-guard";

export default function AdminQuestionsLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
