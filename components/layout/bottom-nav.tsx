"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  BookOpen,
  Target,
  ChartNoAxesCombined,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  // Hide the bottom navigation bar during active quiz sessions to maintain 100% test immersion
  const isTakingQuiz =
    pathname.startsWith("/quiz/") &&
    pathname.split("/").length === 3 &&
    !pathname.endsWith("/results");

  if (isTakingQuiz || pathname === "/" || pathname.startsWith("/auth/")) return null;

  const NAV_ITEMS = [
    {
      label: "Home",
      href: "/dashboard",
      icon: House,
      match: (p: string) => p === "/" || p === "/dashboard",
    },
    {
      label: "Study",
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
      label: "Progress",
      href: "/analytics",
      icon: ChartNoAxesCombined,
      match: (p: string) => p.startsWith("/analytics") || p === "/history",
    },
    {
      label: "More",
      href: "/more",
      icon: Menu,
      match: (p: string) =>
        p.startsWith("/more") ||
        p.startsWith("/profile") ||
        p.startsWith("/settings") ||
        p.startsWith("/mistakes") ||
        p === "/bookmarks" ||
        p === "/notes" ||
        p === "/review" ||
        p === "/leaderboard",
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-card/95 shadow-[0_-4px_24px_#16234806] backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "max(0.4rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto grid h-16 max-w-2xl grid-cols-5 items-center px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex min-h-11 flex-col items-center justify-center gap-1 py-1 text-[10px] font-medium transition-all select-none app-interactive",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
            >
              <div
                className={cn(
                  "relative flex h-7 w-12 items-center justify-center rounded-full transition-all duration-200",
                  isActive
                    ? "bg-primary/14 text-primary scale-105"
                    : "text-muted-foreground group-hover:bg-muted/50"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
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
