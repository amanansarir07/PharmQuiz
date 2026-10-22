"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardList, GraduationCap, Target, TrendingUp } from "lucide-react";
import { useActiveProgram } from "@/lib/program";
import { LearningPage, PageHeading } from "@/components/learning-ui";

export function GuestHome() {
  const { program } = useActiveProgram();

  return (
    <LearningPage>
      <PageHeading eyebrow="Your learning starts here" title="A good day to learn something." description="Explore your syllabus, try a few questions, and find your rhythm." action={<span className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">Guest mode</span>} />

      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-[#294bc9] p-5 text-white sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white"><GraduationCap className="size-6" /></div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[.15em] text-blue-200">Your programme</p>
            <h2 className="mt-1 text-xl font-bold">{program.name}{program.level ? ` · ${program.level}` : ""}</h2>
            <p className="mt-2 text-sm leading-6 text-blue-100">Choose a subject, focus on a unit, and practise at your pace.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link href="/quiz" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-blue-800">Try your first practice <ArrowRight className="size-4" /></Link>
          <Link href="/programs" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 px-5 text-sm font-semibold text-white hover:bg-white/10">Change programme</Link>
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
    </LearningPage>
  );
}
