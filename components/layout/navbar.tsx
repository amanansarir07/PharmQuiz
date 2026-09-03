"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, APP_NAME } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import { useTheme } from "next-themes";
import {
  GraduationCap,
  Menu,
  X,
  Sun,
  Moon,
  User,
  ChevronDown,
  BarChart3,
  Bookmark,
  StickyNote,
  BookOpen,
History,
} from "lucide-react";

const MORE_LINKS = [
  { href: "/review", label: "Review", icon: BookOpen },
  { href: "/history", label: "History", icon: History },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
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
  const router = useRouter();
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
        </Link>

        {/* Desktop Nav */}
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
                  className="absolute right-0 top-full mt-1 w-44 rounded-xl border bg-popover p-1.5 shadow-lg"
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

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/dashboard" className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">Dashboard</Link>
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
              <button onClick={() => { logout(); router.push("/"); }} className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">Sign Out</button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">Sign In</Link>
              <Link href="/auth/register" className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Get Started</Link>
            </div>
          )}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground overflow-hidden"
            aria-label="Toggle dark mode"
          >
            <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
          <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-3 max-h-[70vh] overflow-y-auto">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === link.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                {link.label}
              </Link>
            ))}
            {isLoggedIn && (
              <>
                {MORE_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === link.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                    <link.icon className="inline h-4 w-4 mr-2" />{link.label}
                  </Link>
                ))}
                <hr className="my-2 border-border" />
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">
                  <User className="h-4 w-4" />Profile
                </Link>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">Dashboard</Link>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted text-left w-full"
                >
                  {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                </button>
                <button onClick={() => { logout(); setMobileOpen(false); router.push("/"); }} className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted text-left w-full">Sign Out</button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
