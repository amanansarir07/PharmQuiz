"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function PublicHomeRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [isLoading, router, user]);

  return children;
}
