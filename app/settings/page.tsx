"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { GraduationCap, LogOut, Monitor, Moon, Sun, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { LearningPage, LinkRow, PageHeading, SectionHeading } from "@/components/learning-ui";
import { toast } from "@/components/ui/toast";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { program } = useActiveProgram();
  const { theme, setTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setThemeReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const activeTheme = themeReady ? theme : undefined;
  const router = useRouter();

  return <LearningPage className="max-w-4xl">
    <PageHeading eyebrow="Preferences" title="Settings" description="Manage your learning experience." />
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-start lg:gap-9">
      <div className="space-y-7">
        <section>
          <SectionHeading title="Appearance" />
          <div className="rounded-2xl border bg-card p-4">
            <p className="mb-3 text-sm text-muted-foreground">Choose how Bujh looks on this device.</p>
            <div className="grid grid-cols-3 gap-2">
              {[{ value: "light", label: "Light", icon: Sun }, { value: "dark", label: "Dark", icon: Moon }, { value: "system", label: "System", icon: Monitor }].map(({ value, label, icon: Icon }) => (
                <button key={value} type="button" aria-pressed={activeTheme === value} onClick={() => setTheme(value)} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors ${activeTheme === value ? "border-primary bg-primary/10 text-primary" : "border-border/70 bg-background/50 text-foreground hover:bg-muted"}`}>
                  <Icon className="size-4" aria-hidden="true" />{label}
                </button>
              ))}
            </div>
          </div>
        </section>
        <section>
          <SectionHeading title="Programme" />
          <div className="overflow-hidden rounded-2xl border bg-card">
            <LinkRow href="/programs" icon={<GraduationCap className="size-5" />} title={program.shortLabel} detail="Switch your active programme" />
          </div>
        </section>
      </div>
      <section>
        <SectionHeading title="Account" />
        <div className="overflow-hidden rounded-2xl border bg-card">
          {user ? <><LinkRow href="/profile#account-settings" icon={<UserRound className="size-5" />} title="Manage account" detail="Name, email and password" /><button type="button" disabled={loggingOut} onClick={async () => { setLoggingOut(true); try { await logout(); router.push("/"); } catch { setLoggingOut(false); toast("Could not sign out", "error", "Try again."); } }} className="flex min-h-14 w-full items-center gap-3 px-4 text-left text-sm font-semibold text-rose-600 hover:bg-muted/50 disabled:opacity-60"><LogOut className="size-5" /> {loggingOut ? "Signing out…" : "Sign out"}</button></> : <><LinkRow href="/auth/login" icon={<UserRound className="size-5" />} title="Login" /><div className="border-t px-4 py-3"><Link href={`/auth/register?program=${encodeURIComponent(program.slug)}`} className="flex min-h-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">Create free account</Link></div></>}
        </div>
      </section>
    </div>
  </LearningPage>;
}
