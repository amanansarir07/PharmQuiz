"use client";

import { AccountRequiredState } from "@/components/account-required-state";

export default function MockTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountRequiredState title="Take a full mock test" description="Create a free account to take timed mock exams and keep your scores linked to your own profile. You can try short practice quizzes as a guest.">{children}</AccountRequiredState>;
}
