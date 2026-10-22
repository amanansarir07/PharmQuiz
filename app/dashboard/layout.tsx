"use client";

import { useAuth } from "@/lib/auth";
import { GuestHome } from "@/components/guest-home";
import { AppError, AppLoading } from "@/components/app-state";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, authRestorationTimedOut } = useAuth();
  if (isLoading) return <AppLoading label="Loading your dashboard" />;
  if (authRestorationTimedOut) return <AppError title="Could not check your session" description="We could not confirm your account right now. Please try again." onRetry={() => window.location.reload()} />;
  return user ? <>{children}</> : <GuestHome />;
}
