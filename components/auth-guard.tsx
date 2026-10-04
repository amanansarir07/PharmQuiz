"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AppLoading } from "@/components/app-state";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Don't redirect immediately — the session might still be restoring.
      // Wait a short grace period, then redirect to login.
      const timer = setTimeout(() => {
        setRedirecting(true);
        router.replace("/auth/login");
      }, 800);
      return () => clearTimeout(timer);
    }

  }, [user, isLoading, router]);

  // Show loading while auth is resolving
  if (isLoading || (!user && !redirecting)) {
    return <AppLoading label="Checking your account" />;
  }

  if (redirecting && !user) {
    return <AppLoading label="Taking you to sign in" />;
  }

  return <>{children}</>;
}
