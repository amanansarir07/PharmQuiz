"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Check, GraduationCap, LoaderCircle, LogOut, Monitor, Moon, Sun, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { LearningPage, LinkRow, PageHeading, SectionHeading } from "@/components/learning-ui";
import { toast } from "@/components/ui/toast";
import { ProgrammeIcon } from "@/components/programme-icon";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { program, availablePrograms, setProgramSlug } = useActiveProgram();
  const { theme, setTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [programOpen, setProgramOpen] = useState(false);
  const [pendingProgramSlug, setPendingProgramSlug] = useState<string | null>(null);
  const [switchingProgram, setSwitchingProgram] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setThemeReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const activeTheme = themeReady ? theme : undefined;
  const router = useRouter();
  const pendingProgram = availablePrograms.find((item) => item.slug === pendingProgramSlug);

  function confirmProgramSwitch() {
    if (!pendingProgram || switchingProgram) return;

    setSwitchingProgram(true);
    setProgramSlug(pendingProgram.slug);
    window.setTimeout(() => {
      setProgramOpen(false);
      setPendingProgramSlug(null);
      setSwitchingProgram(false);
    }, 650);
  }

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
            <button type="button" onClick={() => setProgramOpen(true)} className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50">
              <GraduationCap className="size-5 shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{program.shortLabel}</span>
                <span className="block text-xs text-muted-foreground">Switch your active programme</span>
              </span>
            </button>
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
    <Dialog open={programOpen} onOpenChange={(open) => {
      if (switchingProgram) return;
      setProgramOpen(open);
      if (open) setPendingProgramSlug(null);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{pendingProgram ? `Switch to ${pendingProgram.shortLabel}?` : "Switch programme"}</DialogTitle>
          <DialogDescription>{pendingProgram ? "Your study home and practice options will update to this programme." : "Your subjects and practice sessions follow the selected syllabus."}</DialogDescription>
        </DialogHeader>
        {pendingProgram ? (
          switchingProgram ? (
            <div className="flex min-h-32 flex-col items-center justify-center gap-3 text-center" role="status" aria-live="polite">
              <LoaderCircle className="size-6 animate-spin text-primary" aria-hidden="true" />
              <p className="text-sm font-semibold">Switching programme…</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">Current programme</p>
                <p className="text-sm font-semibold">{program.shortLabel}</p>
                <div className="border-t pt-2">
                  <p className="text-xs font-medium text-muted-foreground">Switch to</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <ProgrammeIcon program={pendingProgram} className="size-9" iconClassName="size-4" />
                    <p className="text-sm font-semibold">{pendingProgram.name}{pendingProgram.level && ` · ${pendingProgram.level}`}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setPendingProgramSlug(null)} className="min-h-11 rounded-lg border px-4 text-sm font-semibold hover:bg-muted">Keep current</button>
                <button type="button" onClick={confirmProgramSwitch} className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Switch programme</button>
              </div>
            </>
          )
        ) : (
          <div className="space-y-2">
            {availablePrograms.map((item) => (
              <button
                type="button"
                key={item.slug}
                aria-current={program.slug === item.slug ? "true" : undefined}
                onClick={() => {
                  if (item.slug === program.slug) {
                    setProgramOpen(false);
                    return;
                  }
                  setPendingProgramSlug(item.slug);
                }}
                className={cn("flex min-h-16 w-full items-center gap-3 rounded-xl border p-3 text-left", program.slug === item.slug ? "border-primary bg-primary/5" : "hover:bg-muted")}
              >
                <ProgrammeIcon program={item} className="size-9" iconClassName="size-4" />
                <span className="min-w-0 flex-1 text-sm font-semibold">{item.name}{item.level && ` · ${item.level}`}</span>
                {program.slug === item.slug && <Check className="size-5 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  </LearningPage>;
}
