"use client";

import { useAuth } from "@/lib/auth";
import { GuestHome } from "@/components/guest-home";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  return user ? <>{children}</> : <GuestHome />;
}
