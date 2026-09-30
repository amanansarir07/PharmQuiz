"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, APP_NAME } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { useTheme } from "next-themes";
import {
  Menu,
  X,
  Sun,
  Moon,
  User,
  ChevronDown,
  ChevronLeft,
  CheckCircle2,
  BarChart3,
  Bookmark,
  StickyNote,
  BookOpen,
  GraduationCap,
  History,
  Sparkles,
} from "lucide-react";

const MORE_LINKS = [
  { href: "/review", label: "Review Missed", icon: BookOpen },
  { href: "/history", label: "Quiz History", icon: History },
  { href: "/bookmarks", label: "Saved Questions", icon: Bookmark },
  { href: "/notes", label: "Revision Notes", icon: StickyNote },
  { href: "/analytics", label: "Performance", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProgramSheetOpen, setMobileProgramSheetOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!moreOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moreOpen]);

  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { program, availablePrograms, setProgramSlug } = useActiveProgram();
  const router = useRouter();
  const isLoggedIn = !!user;
  const [programOpen, setProgramOpen] = useState(false);
  const programRef = useRef<HTMLDivElement>(null);

  // Close desktop program dropdown when clicking outside
  useEffect(() => {
    if (!programOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (programRef.current && !programRef.current.contains(e.target as Node)) {
        setProgramOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [programOpen]);

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    if (mobileProgramSheetOpen || mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileProgramSheetOpen, mobileOpen]);

  const programLabel = program.level
    ? `${program.name} · ${program.level}`
    : program.name;

  // Subpage check for native back arrow on mobile
  const isSubpage =
    pathname.startsWith("/subjects/") ||
    (pathname.startsWith("/programs/") && pathname !== "/programs") ||
    pathname === "/bookmarks" ||
    pathname === "/notes" ||
    pathname === "/history" ||
    pathname === "/review" ||
    pathname === "/analytics";

  // Hide the global website navbar during active test-taking
  const isTakingQuiz =
    pathname.startsWith("/quiz/") &&
    pathname.split("/").length === 3 &&
    !pathname.endsWith("/results");

  if (isTakingQuiz) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-3.5 sm:px-6">
        
        {/* Mobile Left / Desktop Left */}
        <div className="flex items-center gap-2">
          {/* Mobile Back Button (on subpages) */}
          {isSubpage ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="flex md:hidden items-center gap-1 -ml-1 rounded-xl px-2 py-1 text-xs font-semibold text-foreground hover:bg-muted active:scale-95 transition-all app-interactive"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-2 shrink-0 app-interactive">
              <Image src="/icons/icon-192.png" alt="" width={192} height={192} className="h-7 w-7" />
              <span className="text-lg md:text-xl font-bold tracking-tight">{APP_NAME}</span>
            </Link>
          )}

          {/* Desktop Logo when subpage is active */}
          {isSubpage && (
            <Link href="/" className="hidden md:flex items-center gap-2 shrink-0 ml-1">
              <Image src="/icons/icon-192.png" alt="" width={192} height={192} className="h-7 w-7" />
              <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
            </Link>
          )}
        </div>

        {/* Mobile Center: Prominent Active Programme Pill */}
        <div className="flex md:hidden items-center justify-center">
          <button
            type="button"
            onClick={() => setMobileProgramSheetOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-2.5 py-1 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted active:scale-95 transition-all max-w-[180px] app-interactive"
            title={`Active: ${programLabel} — Tap to switch`}
          >
            <span className="text-sm shrink-0">{program.icon}</span>
            <span className="truncate">{program.shortLabel}</span>
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn && (
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  MORE_LINKS.some((l) => pathname === l.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                More
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", moreOpen && "rotate-180")} />
              </button>
              {moreOpen && (
                <div
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute right-0 top-full mt-1 w-48 rounded-xl border bg-popover p-1.5 shadow-lg"
                >
                  {MORE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        pathname === link.href
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right Side: Desktop program switcher & Auth / Mobile buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop Active Program Switcher */}
          <div className="relative hidden md:block" ref={programRef}>
            {availablePrograms.length > 1 ? (
              <button
                onClick={() => setProgramOpen((o) => !o)}
                title={`Studying ${programLabel}`}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors",
                  programOpen
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{program.icon}</span>
                <span className="max-w-[150px] truncate">
                  {program.shortLabel}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    programOpen && "rotate-180"
                  )}
                />
              </button>
            ) : (
              <Link
                href="/programs"
                title={`Studying ${programLabel} — browse all programs`}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span>{program.icon}</span>
                <span className="max-w-[150px] truncate">
                  {program.shortLabel}
                </span>
              </Link>
            )}
            {programOpen && (
              <div
                onMouseDown={(e) => e.preventDefault()}
                className="absolute left-0 top-full mt-1 w-56 rounded-xl border bg-popover p-1.5 shadow-lg"
              >
                {availablePrograms.map((p) => (
                  <button
                    key={p.slug}
                    onClick={() => {
                      setProgramSlug(p.slug);
                      setProgramOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                      p.slug === program.slug
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{p.icon}</span>
                      <span className="truncate">{p.shortLabel}</span>
                    </div>
                    {p.slug === program.slug && (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop User Account buttons */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Edit profile"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <span className="max-w-[100px] truncate">{user?.name?.split(" ")[0] || "User"}</span>
              </Link>
              <button
                onClick={() => { logout(); router.push("/"); }}
                className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                Sign In
              </Link>
              <Link href="/auth/register" className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Get Started
              </Link>
            </div>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground overflow-hidden app-interactive"
            aria-label="Toggle dark mode"
          >
            <Sun className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>

          {/* Mobile Study Tools Drawer Trigger */}
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground app-interactive"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Open study menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* NATIVE MOBILE BOTTOM SHEET: PROGRAMME SWITCHER                      */}
      {/* =================================================================== */}
      {mobileProgramSheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setMobileProgramSheetOpen(false)}
          />
          {/* Sliding Bottom Card */}
          <div className="relative z-10 max-h-[85vh] overflow-y-auto rounded-t-[28px] border-t border-border/80 bg-card p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Choose Programme
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your syllabus, mock tests, and question banks update automatically.
                </p>
              </div>
              <button
                onClick={() => setMobileProgramSheetOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground app-interactive"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Live Programmes
              </p>
              {availablePrograms.map((p) => {
                const isSelected = p.slug === program.slug;
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => {
                      setProgramSlug(p.slug);
                      setMobileProgramSheetOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all app-interactive active:scale-[0.98]",
                      isSelected
                        ? "border-primary bg-primary/8 text-primary shadow-xs ring-1 ring-primary/40"
                        : "border-border/60 hover:bg-muted/50 text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.icon}</span>
                      <div>
                        <div className="font-semibold text-sm">
                          {p.name} {p.level ? `· ${p.level}` : ""}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {p.description}
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 border-t border-border/60 pt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Looking for other courses?</span>
              <Link
                href="/programs"
                onClick={() => setMobileProgramSheetOpen(false)}
                className="font-semibold text-primary hover:underline"
              >
                Browse All Streams →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* NATIVE MOBILE SLIDE-DOWN: STUDY TOOLS & EXTRA OPTIONS               */}
      {/* =================================================================== */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-xl px-4 py-4 max-h-[75vh] overflow-y-auto shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Study Tools
            </span>
            <span className="text-xs text-muted-foreground">
              {program.shortLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {MORE_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card p-3 text-xs font-semibold text-foreground hover:bg-muted active:scale-95 transition-all app-interactive"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <hr className="my-3 border-border/60" />

          {isLoggedIn ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">{user.name}</span>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  View Profile
                </Link>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                  router.push("/");
                }}
                className="w-full rounded-xl bg-destructive/10 py-2.5 text-center text-xs font-semibold text-destructive hover:bg-destructive/20 active:scale-95 transition-all app-interactive"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-border/80 py-2.5 text-center text-xs font-semibold text-foreground hover:bg-muted active:scale-95 transition-all app-interactive"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl bg-primary py-2.5 text-center text-xs font-semibold text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all app-interactive"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
