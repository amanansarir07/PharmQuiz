"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { GraduationCap, LogOut, Moon, Sun, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { LearningPage, LinkRow, PageHeading, SectionHeading } from "@/components/learning-ui";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { program } = useActiveProgram();
  const { resolvedTheme, setTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setThemeReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const activeTheme = themeReady ? resolvedTheme : undefined;
  const router = useRouter();

  return <LearningPage className="max-w-3xl">
    <PageHeading backHref="/more" eyebrow="Preferences" title="Settings" description="Manage your learning experience." />
    <SectionHeading title="Appearance" />
    <div className="mb-7 rounded-2xl border bg-card p-4"><p className="mb-3 text-sm text-muted-foreground">Choose how Bujh looks on this device.</p><div className="grid grid-cols-2 gap-2">{[{ value: "light", label: "Light", icon: Sun }, { value: "dark", label: "Dark", icon: Moon }].map(({ value, label, icon: Icon }) => <button key={value} type="button" aria-pressed={activeTheme === value} onClick={() => setTheme(value)} className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold ${activeTheme === value ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"}`}><Icon className="size-4" />{label}</button>)}</div></div>
    <SectionHeading title="Programme" /><div className="mb-7 overflow-hidden rounded-2xl border bg-card"><LinkRow href="/programs" icon={<GraduationCap className="size-5" />} title={program.shortLabel} detail="Switch your active programme" /></div>
    <SectionHeading title="Account" />
    <div className="overflow-hidden rounded-2xl border bg-card">{user ? <><LinkRow href="/profile#account-settings" icon={<UserRound className="size-5" />} title="Manage account" detail="Name, email and password" /><button type="button" onClick={async () => { await logout(); router.push("/"); }} className="flex min-h-14 w-full items-center gap-3 px-4 text-left text-sm font-semibold text-rose-600 hover:bg-muted/50"><LogOut className="size-5" /> Sign out</button></> : <><LinkRow href="/auth/login" icon={<UserRound className="size-5" />} title="Login" /><div className="border-t px-4 py-3"><Link href={`/auth/register?program=${encodeURIComponent(program.slug)}`} className="flex min-h-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">Create free account</Link></div></>}</div>
  </LearningPage>;
}
