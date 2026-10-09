"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardList, GraduationCap, Target, TrendingUp } from "lucide-react";
import { useActiveProgram } from "@/lib/program";

export function GuestHome() {
  const { program } = useActiveProgram();

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-12">
      <div className="mb-7 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Learn. Practice. Understand.</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Start learning with Bujh</h1>
          <p className="mt-2 text-sm text-muted-foreground">Explore the syllabus and try a real practice session.</p>
        </div>
        <span className="hidden rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground sm:inline">Guest mode</span>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><GraduationCap className="size-6" /></div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Your programme</p>
            <h2 className="mt-1 text-xl font-bold">{program.name}{program.level ? ` · ${program.level}` : ""}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose a subject, focus on a unit, and practise at your pace.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link href="/subjects" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">Explore subjects <ArrowRight className="size-4" /></Link>
          <Link href="/programs" className="inline-flex min-h-11 items-center justify-center rounded-xl border bg-card px-5 text-sm font-semibold">Change programme</Link>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold">What would you like to do?</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { href: "/subjects", title: "Study the syllabus", text: "Browse subjects, units and topics.", icon: BookOpen },
          { href: "/quiz", title: "Try practice MCQs", text: "Complete a short quiz with real questions.", icon: Target },
          { href: "/review", title: "Question bank", text: "Search questions and reveal answers.", icon: ClipboardList },
        ].map(({ href, title, text, icon: Icon }) => (
          <Link key={href} href={href} className="group flex gap-3 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/40">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
            <span><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs text-muted-foreground">{text}</span></span>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3"><TrendingUp className="mt-0.5 size-5 shrink-0 text-primary" /><div><h2 className="font-semibold">Keep your progress</h2><p className="mt-1 text-sm text-muted-foreground">Create a free account for synced results, study notes, mistakes and leaderboards.</p></div></div>
        <Link href={`/auth/register?program=${encodeURIComponent(program.slug)}`} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-primary px-4 text-sm font-semibold text-primary">Create free account</Link>
      </div>
    </div>
  );
}
