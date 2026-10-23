"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { BookOpen, Check, ChevronDown, ChevronLeft, ClipboardCheck, House, LayoutGrid, Moon, Search, Settings, Sun, Target, UserRound, ChartNoAxesCombined, RotateCcw, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { cn } from "@/lib/utils";
import { Brand } from "@/components/brand";
import { ProgrammeIcon } from "@/components/programme-icon";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const groups = [
  { label: "Learn", items: [
    { href: "/dashboard", label: "Overview", icon: House },
    { href: "/subjects", label: "My subjects", icon: BookOpen },
    { href: "/quiz", label: "Practice MCQs", icon: Target },
    { href: "/mock-test", label: "Mock tests", icon: ClipboardCheck },
  ] },
  { label: "Study", items: [
    { href: "/review", label: "Question bank", icon: LayoutGrid },
    { href: "/mistakes", label: "Mistakes bank", icon: RotateCcw },
    { href: "/analytics", label: "My progress", icon: ChartNoAxesCombined },
  ] },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin, isLoading } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { program, availablePrograms, setProgramSlug } = useActiveProgram();
  const [programOpen, setProgramOpen] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const publicPage = pathname === "/";
  const dashboardHome = pathname === "/dashboard";
  const activeQuiz = /^\/quiz\/[^/]+$/.test(pathname);
  const adminGroup = { label: "Administration", items: [
    { href: "/admin/questions", label: "Question imports", icon: ShieldCheck },
    { href: "/admin/mock-exams", label: "Manage mock exams", icon: ClipboardCheck },
  ] };
  const visibleGroups = isAdmin ? [...groups, adminGroup] : groups;
  const route = visibleGroups.flatMap((group) => group.items).find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
  const title = route?.label || ({ "/programs": "Programmes", "/profile": "My profile", "/settings": "Settings", "/more": "Your study space" }[pathname] ?? "Study space");
  const subpage = pathname.startsWith("/subjects/") || pathname.startsWith("/programs/") || ["/notes", "/bookmarks", "/mistakes", "/profile", "/settings", "/history", "/review"].includes(pathname);
  const backHref = pathname.startsWith("/subjects/") ? "/subjects" : pathname.startsWith("/programs/") ? "/programs" : "/more";

  const themeButton = <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="icon-button" aria-label="Switch colour theme"><Sun className="size-[18px] dark:hidden" /><Moon className="hidden size-[18px] dark:block" /></button>;
  const firstName = user?.name?.trim().split(/\s+/)[0];

  useEffect(() => {
    const frame = requestAnimationFrame(() => setThemeReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (activeQuiz || pathname.startsWith("/auth/")) return null;

  if (publicPage) return <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl"><div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8"><Link href="/" aria-label="Bujh home"><Brand compact /></Link><nav className="hidden items-center gap-8 text-sm font-medium md:flex" aria-label="Explore Bujh"><Link href="/programs">Programmes</Link><Link href="/dashboard">Explore the app</Link><a href="#how-it-works">How it works</a></nav><div className="flex items-center gap-2">{themeButton}<Link href="/auth/login" className="hidden px-3 text-sm font-semibold sm:block">Log in</Link><Link href="/auth/register" className="action-primary min-h-10 px-4 text-xs sm:text-sm">Get started</Link></div></div></header>;

  return <>
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] flex-col border-r border-border/80 bg-sidebar lg:flex">
      <Link href="/dashboard" className="flex h-22 shrink-0 items-center px-6" aria-label="Bujh overview"><Brand /></Link>
      <button type="button" onClick={() => setProgramOpen(true)} className="mx-4 mb-5 flex min-h-11 items-center gap-2 rounded-lg border bg-background px-3 text-left hover:border-primary/40"><span className="min-w-0 flex-1 truncate text-xs font-semibold">{program.shortLabel}</span><ChevronDown className="size-3.5 text-muted-foreground" /></button>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-5" aria-label="Main navigation">{visibleGroups.map((group) => <div key={group.label}><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">{group.label}</p><div className="space-y-1">{group.items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors", active ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><Icon className="size-[18px]" strokeWidth={active ? 2.2 : 1.7} /><span>{label}</span>{active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}</Link>;
      })}</div></div>)}</nav>
      <div className="border-t p-3"><Link href="/more" className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] text-muted-foreground hover:bg-muted">Library and more</Link><Link href="/settings" className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] text-muted-foreground hover:bg-muted"><Settings className="size-[18px]" />Settings</Link>{isLoading ? <div className="mt-2 flex items-center gap-3 rounded-lg bg-muted/70 p-3" role="status" aria-label="Loading account"><span className="size-9 shrink-0 animate-pulse rounded-full bg-muted-foreground/15" /><span className="min-w-0 flex-1 space-y-1.5"><span className="block h-3 w-20 animate-pulse rounded bg-muted-foreground/15" /><span className="block h-2.5 w-28 animate-pulse rounded bg-muted-foreground/10" /></span></div> : <Link href={user ? "/profile" : "/auth/login"} className="mt-2 flex items-center gap-3 rounded-lg bg-muted/70 p-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{user?.name?.slice(0, 2).toUpperCase() || <UserRound className="size-4" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{user?.name || "Guest learner"}</span><span className="text-[10px] text-muted-foreground">{user ? "View your profile" : "Sign in to save progress"}</span></span></Link>}</div>
    </aside>
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl lg:ml-[244px]">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-7 lg:h-[76px] lg:px-9">
        <div className="hidden lg:block"><p className="text-[11px] text-muted-foreground">Your learning workspace</p><p className="mt-0.5 text-sm font-semibold">{title}</p></div>
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          {dashboardHome ? (
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-muted-foreground">{program.shortLabel} · Study home</p>
              <p className="truncate text-sm font-extrabold leading-5">{user ? `Good morning, ${firstName || "Student"}` : "Welcome back"}</p>
            </div>
          ) : (
            <>
              {subpage ? <Link href={backHref} className="icon-button -ml-2" aria-label="Go back"><ChevronLeft className="size-5" /></Link> : <Link href="/dashboard" aria-label="Bujh overview"><Brand compact /></Link>}
              {subpage && <span className="max-w-[10rem] truncate text-sm font-semibold">{title}</span>}
            </>
          )}
        </div>
        <button type="button" onClick={() => setProgramOpen(true)} className="flex min-h-9 min-w-0 max-w-24 shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 text-[10px] font-bold text-secondary-foreground lg:hidden"><span className="truncate">{program.shortLabel}</span><ChevronDown className="size-3 shrink-0" /></button>
        <div className={cn("flex items-center gap-2 sm:gap-3", dashboardHome && "hidden lg:flex")}><Link href="/review" className="hidden min-h-10 items-center gap-3 rounded-xl bg-card px-4 text-xs text-muted-foreground shadow-[var(--shadow-card)] lg:flex"><Search className="size-4" />Find a question</Link>{themeButton}<Link href={user ? "/profile" : "/auth/login"} aria-label={user ? "My profile" : "Log in"} className="hidden size-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground sm:flex">{user?.name?.slice(0, 2).toUpperCase() || <UserRound className="size-4" />}</Link></div>
        {dashboardHome && <details className="relative lg:hidden">
          <summary aria-label="Open profile menu" className="flex size-10 list-none items-center justify-center rounded-full bg-secondary text-sm font-extrabold text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {user?.name?.slice(0, 2).toUpperCase() || <UserRound className="size-[18px]" />}
          </summary>
          <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl bg-popover p-2 text-popover-foreground shadow-[var(--shadow-floating)] ring-1 ring-border/50">
            <Link href={user ? "/profile" : "/auth/login"} className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-muted">{user?.name || "Guest learner"}<span className="mt-0.5 block text-xs font-medium text-muted-foreground">{user ? "View profile" : "Sign in to save progress"}</span></Link>
            <Link href="/settings" className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-muted">Settings</Link>
            <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="flex min-h-10 w-full items-center justify-between rounded-xl px-3 text-sm font-semibold hover:bg-muted"><span>Appearance</span>{themeReady && (resolvedTheme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />)}</button>
          </div>
        </details>}
      </div>
    </header>
    <Dialog open={programOpen} onOpenChange={setProgramOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Choose your programme</DialogTitle><DialogDescription>Your subjects and practice sessions follow this syllabus.</DialogDescription></DialogHeader><div className="space-y-2">{availablePrograms.map((item) => <button type="button" key={item.slug} onClick={() => { setProgramSlug(item.slug); setProgramOpen(false); }} className={cn("flex min-h-16 w-full items-center gap-3 rounded-xl border p-3 text-left", program.slug === item.slug ? "border-primary bg-primary/5" : "hover:bg-muted")}><ProgrammeIcon program={item} className="size-9" iconClassName="size-4" /><span className="min-w-0 flex-1 text-sm font-semibold">{item.name}{item.level && ` · ${item.level}`}</span>{program.slug === item.slug && <Check className="size-5 text-primary" />}</button>)}</div><Link onClick={() => setProgramOpen(false)} href="/programs" className="action-secondary">Explore all programmes</Link></DialogContent></Dialog>
  </>;
}
