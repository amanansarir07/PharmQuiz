"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpen, Check, ChevronDown, Eye, EyeOff, GraduationCap, Lock, Mail, Pill, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProgram } from "@/data/registry";
import { programs } from "@/data/programs";
import { useAuth } from "@/lib/auth";
import { safeSetItem } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { ProgrammeIcon } from "@/components/programme-icon";

type Step = 1 | 2 | 3;

const programmeGroups = [
  { title: "CTEVT", description: "Diploma and certificate programmes", slugs: ["d-pharm-y1", "d-pharm-y2", "d-pharm-y3"] },
  { title: "+2", description: "Higher secondary streams", slugs: ["plus-two-science-bio", "plus-two-computer", "plus-two-management"] },
  { title: "Professional exams", description: "Post-study registration preparation", slugs: ["c-pharm"] },
] as const;
const groupIcons = { CTEVT: Pill, "+2": GraduationCap, "Professional exams": BadgeCheck };

function GoogleIcon() {
  return <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>;
}

export default function RegisterPage() {
  return <Suspense fallback={<Loading />}><RegisterForm /></Suspense>;
}

function Loading() {
  return <div className="auth-register-loading"><span className="size-7 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
}

function RegisterForm() {
  const router = useRouter();
  const queryProgram = useSearchParams().get("program") || "";
  const { register, signInWithGoogle, user, isLoading } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [programSlug, setProgramSlug] = useState(() => getProgram(queryProgram)?.hasContent ? queryProgram : "");
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (programSlug || typeof window === "undefined") return;
    const stored = localStorage.getItem("bujh-pending-program") || localStorage.getItem("bujh-active-program");
    if (stored && getProgram(stored)?.hasContent) {
      const frame = requestAnimationFrame(() => setProgramSlug(stored));
      return () => cancelAnimationFrame(frame);
    }
  }, [programSlug]);
  useEffect(() => { if (!isLoading && user) router.replace("/dashboard"); }, [isLoading, router, user]);

  const selectedProgram = programSlug ? getProgram(programSlug) : undefined;
  const chooseProgramme = (slug: string) => {
    setProgramSlug(slug);
    setError("");
    safeSetItem("bujh-pending-program", slug);
    safeSetItem("bujh-active-program", slug);
  };
  const validateDetails = () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) return "Enter your full name.";
    if (!/^[\p{L}]+( [\p{L}]+)*$/u.test(trimmedName)) return "Name can only contain letters and spaces.";
    if (!email.includes("@")) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return "";
  };
  const goToDetails = () => {
    if (!programSlug) { setError("Choose a programme to continue."); return; }
    setError("");
    setStep(2);
  };
  const goToFinish = (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateDetails();
    if (validationError) { setError(validationError); return; }
    setError("");
    setStep(3);
  };
  const createAccount = async () => {
    const validationError = validateDetails();
    if (validationError || !programSlug) {
      setError(validationError || "Choose a programme to continue.");
      setStep(validationError ? 2 : 1);
      return;
    }
    setLoading(true);
    setError("");
    const result = await register(name.trim(), email, password, programSlug);
    if (result.error) { setError(result.error); setLoading(false); }
    else if (result.emailConfirmationRequired) router.push("/auth/login?confirmation=1");
    else router.push("/dashboard");
  };
  const google = async () => {
    if (!programSlug) return;
    setLoading(true);
    const result = await signInWithGoogle();
    if (result.error) { setError(result.error); setLoading(false); }
  };

  if (isLoading || user) return <Loading />;
  return <main className="auth-register-shell">
    <section className="auth-register-content">
      <div className="mb-8 flex items-start justify-between gap-4 sm:mb-10">
        <div>
          <p className="eyebrow">Get started</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-.04em] sm:text-4xl">Create your account</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Choose your programme first. We&apos;ll tailor your practice and progress from there.</p>
        </div>
      </div>
      <Steps step={step} />
      {error && <div role="alert" className="mb-6 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-700 dark:text-red-300">{error}</div>}
      {step === 1 && <section aria-labelledby="programme-title">
        <div className="mb-5"><h2 id="programme-title" className="text-xl font-bold tracking-[-.025em]">Choose your programme</h2><p className="mt-1 text-sm text-muted-foreground">Only programmes with study content are available to start today.</p></div>
        <ProgrammeGroup group={programmeGroups[0]} selectedSlug={programSlug} onSelect={chooseProgramme} />
        <button type="button" onClick={() => setShowComingSoon((shown) => !shown)} className="mt-5 flex w-full items-center justify-between rounded-xl border border-dashed px-4 py-3 text-left text-sm font-medium text-muted-foreground hover:bg-muted/50"><span>More programmes <span className="font-normal">â€” coming soon</span></span><ChevronDown className={cn("size-4 transition-transform", showComingSoon && "rotate-180")} /></button>
        {showComingSoon && <div className="mt-3 space-y-3">{programmeGroups.slice(1).map((group) => <ProgrammeGroup key={group.title} group={group} selectedSlug={programSlug} onSelect={chooseProgramme} compact />)}</div>}
        <ActionBar><Button type="button" onClick={goToDetails} disabled={!programSlug} className="h-12 w-full sm:w-auto sm:min-w-44">Continue <ArrowRight className="size-4" /></Button></ActionBar>
      </section>}
      {step === 2 && <form onSubmit={goToFinish} noValidate>
        <div className="mb-6 flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold tracking-[-.025em]">Your account details</h2><p className="mt-1 text-sm text-muted-foreground">Use an email you can access to keep your progress safe.</p></div><button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-primary hover:underline">Change programme</button></div>
        {selectedProgram && <SelectedProgramme program={selectedProgram} />}
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Full name" htmlFor="name" icon={User}><Input id="name" value={name} onChange={(event) => setName(event.target.value.replace(/[^\p{L} ]/gu, ""))} placeholder="Your full name" autoComplete="name" maxLength={50} required /></Field>
          <Field label="Email address" htmlFor="email" icon={Mail}><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></Field>
          <Field label="Password" htmlFor="password" icon={Lock}><PasswordInput id="password" value={password} onChange={setPassword} show={showPassword} toggle={() => setShowPassword((shown) => !shown)} placeholder="At least 6 characters" /></Field>
          <Field label="Confirm password" htmlFor="confirmPassword" icon={Lock}><Input id="confirmPassword" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" autoComplete="new-password" required minLength={6} /></Field>
        </div>
        <ActionBar><Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 px-4"><ArrowLeft className="size-4" /><span className="hidden sm:inline">Back</span></Button><Button type="submit" className="h-12 flex-1 sm:flex-none sm:min-w-44">Continue <ArrowRight className="size-4" /></Button></ActionBar>
      </form>}
      {step === 3 && <section aria-labelledby="finish-title">
        <div className="mb-6"><h2 id="finish-title" className="text-xl font-bold tracking-[-.025em]">Ready to begin?</h2><p className="mt-1 text-sm text-muted-foreground">Check your details, then create your Bujh account.</p></div>
        {selectedProgram && <SelectedProgramme program={selectedProgram} />}
        <dl className="mt-4 divide-y rounded-2xl border bg-card px-4"><div className="flex items-center justify-between gap-4 py-4"><dt className="text-sm text-muted-foreground">Name</dt><dd className="text-sm font-semibold">{name}</dd></div><div className="flex items-center justify-between gap-4 py-4"><dt className="text-sm text-muted-foreground">Email</dt><dd className="truncate text-sm font-semibold">{email}</dd></div></dl>
        <ActionBar><div className="w-full space-y-3 sm:w-auto"><Button type="button" onClick={createAccount} disabled={loading} className="h-12 w-full sm:min-w-52">{loading ? "Creating account..." : "Create account"}<ArrowRight className="size-4" /></Button><div className="flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">or</div><Button type="button" variant="outline" onClick={google} disabled={loading} className="h-12 w-full sm:min-w-52"><GoogleIcon />Continue with Google</Button><Button type="button" variant="ghost" onClick={() => setStep(2)} className="h-10 w-full text-muted-foreground"><ArrowLeft className="size-4" />Edit details</Button></div></ActionBar>
      </section>}
      <p className="mt-8 text-center text-sm text-muted-foreground">Already have an account? <Link href="/auth/login" className="font-semibold text-primary hover:underline">Sign in</Link></p>
    </section>
  </main>;
}

function Steps({ step }: { step: Step }) {
  const labels = ["Programme", "Details", "Account"];
  return <div className="mb-7 sm:mb-9"><p className="mb-3 text-xs font-semibold text-primary">Step {step} of 3 <span className="font-normal text-muted-foreground">Â· {labels[step - 1]}</span></p><ol aria-label="Registration progress" className="grid grid-cols-3 gap-2 sm:max-w-xl">{([1, 2, 3] as Step[]).map((item) => <li key={item} className="min-w-0"><div className="flex items-center gap-2"><span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", item < step ? "bg-primary text-primary-foreground" : item === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground")}>{item < step ? <Check className="size-4" /> : item}</span><span className={cn("text-xs font-semibold", item === step ? "text-foreground" : "text-muted-foreground")}>{labels[item - 1]}</span></div><div className={cn("mt-2 h-1 rounded-full", item < step ? "bg-primary" : item === step ? "bg-primary/75" : "bg-muted")} /></li>)}</ol></div>;
}

function ProgrammeGroup({ group, selectedSlug, onSelect, compact = false }: { group: typeof programmeGroups[number]; selectedSlug: string; onSelect: (slug: string) => void; compact?: boolean }) {
  const Icon = groupIcons[group.title];
  const listedProgrammes = programs.filter((program) => group.slugs.includes(program.slug as never));
  return <div className={cn("auth-programme-group", compact && "auth-programme-group-compact")}><div className="mb-5 flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span><div><h3 className="font-semibold text-foreground">{group.title}</h3><p className="text-xs text-muted-foreground">{group.description}</p></div></div><div className="space-y-5">{Object.entries(groupByAward(listedProgrammes)).map(([award, sameAward]) => <div key={award}><div className="mb-2.5 flex items-baseline justify-between"><p className="text-[15px] font-semibold text-foreground">{award}</p>{group.title === "CTEVT" && <span className="text-[11px] text-muted-foreground">Choose your year</span>}</div><div className="grid gap-2 sm:grid-cols-3">{sameAward.map((program) => <ProgrammeButton key={program.slug} program={program} selected={program.slug === selectedSlug} onSelect={onSelect} />)}</div></div>)}</div></div>;
}

function groupByAward(list: typeof programs) { return list.reduce<Record<string, typeof programs>>((groups, program) => { groups[program.award] = [...(groups[program.award] || []), program]; return groups; }, {}); }

function ProgrammeButton({ program, selected, onSelect }: { program: (typeof programs)[number]; selected: boolean; onSelect: (slug: string) => void }) {
  return <button type="button" disabled={!program.hasContent} onClick={() => onSelect(program.slug)} className={cn("relative flex min-h-16 items-center justify-between rounded-xl px-3.5 text-left transition-colors", selected ? "border border-primary bg-primary text-primary-foreground shadow-sm" : program.hasContent ? "border border-border bg-card text-foreground hover:border-primary/55 hover:bg-primary/5" : "cursor-not-allowed bg-muted/45 text-muted-foreground opacity-60")}><span><span className="block text-sm font-semibold">{program.level || program.name}</span><span className={cn("mt-0.5 block text-[11px]", selected ? "text-primary-foreground/80" : program.hasContent ? "text-primary" : "text-muted-foreground")}>{selected ? "Selected" : program.hasContent ? "Available" : "Coming soon"}</span></span>{selected ? <span className="flex size-6 items-center justify-center rounded-full bg-primary-foreground/15"><Check className="size-4" /></span> : program.hasContent ? <BookOpen className="size-4 text-primary" /> : null}</button>;
}

function SelectedProgramme({ program }: { program: (typeof programs)[number] }) { return <div className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3"><ProgrammeIcon program={program} className="size-9 bg-primary text-primary-foreground" iconClassName="size-5" /><div className="min-w-0"><p className="text-sm font-semibold">{program.name}{program.level ? " Â· " + program.level : ""}</p><p className="truncate text-xs text-muted-foreground">{program.award}</p></div><Check className="ml-auto size-5 text-primary" /></div>; }

function ActionBar({ children }: { children: React.ReactNode }) { return <div className="auth-register-action flex items-center gap-3">{children}</div>; }

function Field({ label, htmlFor, icon: Icon, children }: { label: string; htmlFor: string; icon: typeof User; children: React.ReactNode }) { return <div className="space-y-2"><Label htmlFor={htmlFor}>{label}</Label><div className="relative"><Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />{children}</div></div>; }

function PasswordInput({ id, value, onChange, show, toggle, placeholder }: { id: string; value: string; onChange: (value: string) => void; show: boolean; toggle: () => void; placeholder: string }) { return <><Input id={id} type={show ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete="new-password" required minLength={6} className="pr-11" /><button type="button" onClick={toggle} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></>; }
