"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { AppError, AppLoading } from "@/components/app-state";
import { useActiveProgram } from "@/lib/program";

export function AccountRequiredState({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  const { user, isLoading, authRestorationTimedOut } = useAuth();
  const { programSlug } = useActiveProgram();
  if (isLoading) return <AppLoading label="Checking your account" />;
  if (authRestorationTimedOut) return <AppError title="Could not check your session" description="We could not confirm your account right now. Please try again." onRetry={() => window.location.reload()} />;
  if (user) return <>{children}</>;

  return <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-12 text-center">
    <p className="mb-2 text-xs font-medium text-muted-foreground">Save your learning</p>
    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
    <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
    <div className="mt-7 flex w-full max-w-xs flex-col gap-2">
      <Link href={`/auth/register?program=${encodeURIComponent(programSlug)}`} className="action-primary">Create free account</Link>
      <Link href="/auth/login" className="action-secondary">Log in</Link>
      <Link href="/dashboard" className="mt-1 text-sm font-medium text-muted-foreground hover:text-primary">Continue as guest</Link>
    </div>
  </div>;
}
