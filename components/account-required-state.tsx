"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AppLoading } from "@/components/app-state";
import { useActiveProgram } from "@/lib/program";

export function AccountRequiredState({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  const { user, isLoading } = useAuth();
  const { programSlug } = useActiveProgram();
  if (isLoading) return <AppLoading label="Checking your account" />;
  if (user) return <>{children}</>;

  return <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-5 py-12 text-center">
    <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><LockKeyhole className="size-7" /></div>
    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">Free account feature</p>
    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
    <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
    <div className="mt-7 flex w-full max-w-xs flex-col gap-2">
      <Link href={`/auth/register?program=${encodeURIComponent(programSlug)}`} className="flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Create free account</Link>
      <Link href="/auth/login" className="flex min-h-11 items-center justify-center rounded-xl border bg-card px-4 text-sm font-semibold">Login</Link>
      <Link href="/dashboard" className="mt-1 text-sm font-medium text-muted-foreground hover:text-primary">Continue as guest</Link>
    </div>
  </div>;
}
