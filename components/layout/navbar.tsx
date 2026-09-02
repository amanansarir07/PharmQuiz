"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, APP_NAME } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import { useTheme } from "next-themes";
import {
  BookOpen,
  GraduationCap,
  Menu,
  X,
  BarChart3,
  Bookmark,
  StickyNote,
  Sun,
  Moon,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
        </Link>

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
            <>
              <Link href="/review" className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === "/review" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                <BookOpen className="inline h-4 w-4 mr-1" /> Review
              </Link>
              <Link href="/bookmarks" className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === "/bookmarks" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                <Bookmark className="inline h-4 w-4 mr-1" /> Bookmarks
              </Link>
              <Link href="/notes" className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === "/notes" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                <StickyNote className="inline h-4 w-4 mr-1" /> Notes
              </Link>
              <Link href="/analytics" className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === "/analytics" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                <BarChart3 className="inline h-4 w-4 mr-1" /> Analytics
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Hi, {user?.name?.split(" ")[0] || "User"}</span>
              <Link href="/dashboard" className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">Dashboard</Link>
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

      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-3">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === link.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <Link href="/review" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"><BookOpen className="inline h-4 w-4 mr-1" /> Review</Link>
                <Link href="/bookmarks" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"><Bookmark className="inline h-4 w-4 mr-1" /> Bookmarks</Link>
                <Link href="/notes" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"><StickyNote className="inline h-4 w-4 mr-1" /> Notes</Link>
                <Link href="/analytics" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"><BarChart3 className="inline h-4 w-4 mr-1" /> Analytics</Link>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted text-left w-full"
                >
                  {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                </button>
                <hr className="my-2" />
                <button onClick={() => { logout(); setMobileOpen(false); router.push("/"); }} className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted text-left w-full">Sign Out</button>
              </>
            ) : (
              <>
                <hr className="my-2" />
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">Sign In</Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground text-center">Get Started</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
