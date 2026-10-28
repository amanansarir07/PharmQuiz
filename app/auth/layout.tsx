"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChartNoAxesCombined, RotateCcw } from "lucide-react";
import { Brand } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const registerPage = pathname === "/auth/register";
  return <div className="min-h-dvh lg:grid lg:grid-cols-[34%_66%]">
    <aside className="relative hidden overflow-hidden bg-[var(--home-profile-to)] p-10 text-white lg:flex lg:flex-col xl:p-14"><Link href="/" aria-label="Bujh home"><Brand /></Link><div className="relative z-10 my-auto max-w-sm py-12"><p className="text-xs font-bold uppercase tracking-[.18em] text-white/80">Learn. Practice. Understand.</p><h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-[-.04em] xl:text-5xl">Small steps.<br />Stronger understanding.</h1><p className="mt-5 text-sm leading-6 text-white/80">Focused practice for the syllabus you are studying today.</p><div className="mt-8 space-y-4">{[{ icon: BookOpen, text: "Questions matched to your syllabus" }, { icon: RotateCcw, text: "Review mistakes and improve" }, { icon: ChartNoAxesCombined, text: "Track progress as you learn" }].map(({ icon: Icon, text }) => <div key={text} className="flex items-center gap-3 text-sm text-white/90"><span className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5"><Icon className="size-4" /></span>{text}</div>)}</div></div><p className="relative z-10 text-xs text-white/70">For students in Nepal.</p><div aria-hidden="true" className="absolute -bottom-48 -right-48 size-[520px] rounded-full border-[72px] border-white/[.035]" /></aside>
    <div className="min-w-0 bg-background"><div className="flex items-center justify-between px-5 pt-5 sm:px-10 sm:pt-7">{registerPage ? <><Link href="/" aria-label="Bujh home" className="lg:hidden"><Brand compact /></Link><Link href="/" className="hidden min-h-11 items-center text-sm text-muted-foreground lg:inline-flex">Home</Link><Link href="/auth/login" className="text-sm font-semibold text-primary hover:underline">Sign in</Link></> : <><Link href="/" className="inline-flex min-h-11 items-center text-sm text-muted-foreground">Home</Link><span className="lg:hidden"><Brand /></span><Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">Explore as guest</Link></>}</div>{children}</div>
  </div>;
}
