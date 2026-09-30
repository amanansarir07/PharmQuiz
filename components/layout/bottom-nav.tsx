"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  Compass,
  BookOpen,
  Target,
  Trophy,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide the bottom navigation bar during active quiz sessions to maintain 100% test immersion
  const isTakingQuiz =
    pathname.startsWith("/quiz/") &&
    pathname.split("/").length === 3 &&
    !pathname.endsWith("/results");

  if (isTakingQuiz) return null;

  const NAV_ITEMS = [
    {
      label: "Home",
      href: user ? "/dashboard" : "/",
      icon: Compass,
      match: (p: string) => p === "/" || p === "/dashboard",
    },
    {
      label: "Syllabus",
      href: "/subjects",
      icon: BookOpen,
      match: (p: string) =>
        p === "/subjects" ||
        p.startsWith("/subjects/") ||
        p.startsWith("/programs"),
    },
    {
      label: "Practice",
      href: "/quiz",
      icon: Target,
      match: (p: string) => p === "/quiz" || p === "/mock-test",
    },
    {
      label: "Rank",
      href: "/leaderboard",
      icon: Trophy,
      match: (p: string) => p.startsWith("/leaderboard"),
    },
    {
      label: user ? "You" : "Account",
      href: user ? "/profile" : "/auth/login",
      icon: User,
      match: (p: string) =>
        p.startsWith("/profile") ||
        p.startsWith("/auth") ||
        p === "/bookmarks" ||
        p === "/notes" ||
        p === "/history" ||
        p === "/review" ||
        p === "/analytics",
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/92 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="grid h-14 grid-cols-5 items-center px-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex flex-col items-center justify-center gap-1 py-1 text-[10px] font-medium transition-all select-none app-interactive",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
            >
              <div
                className={cn(
                  "relative flex h-7 w-12 items-center justify-center rounded-full transition-all duration-200",
                  isActive
                    ? "bg-primary/12 text-primary scale-105"
                    : "text-muted-foreground group-hover:bg-muted/50"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isActive ? "stroke-[2.4]" : "stroke-[1.75]"
                  )}
                />
              </div>
              <span className="truncate max-w-[56px] text-center leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
