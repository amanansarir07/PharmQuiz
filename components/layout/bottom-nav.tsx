"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  MessagesSquare,
  Target,
  ClipboardCheck,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  // Hide the bottom navigation bar during active quiz sessions to maintain 100% test immersion
  const isQuizFlow = /^\/quiz\/[^/]+(?:\/results)?$/.test(pathname);

  if (isQuizFlow || pathname === "/" || pathname.startsWith("/auth/")) return null;

  const NAV_ITEMS = [
    {
      label: "Home",
      href: "/dashboard",
      icon: House,
      match: (p: string) => p === "/" || p === "/dashboard",
    },
    {
      label: "Practice",
      href: "/quiz",
      icon: Target,
      match: (p: string) => p === "/quiz",
    },
    {
      label: "Tests",
      href: "/mock-test",
      icon: ClipboardCheck,
      match: (p: string) => p === "/mock-test",
    },
    {
      label: "Discuss",
      href: "/community",
      icon: MessagesSquare,
      match: (p: string) => p === "/community" || p.startsWith("/community/"),
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
        p === "/leaderboard" ||
        p === "/analytics" ||
        p === "/history" ||
        p === "/subjects" ||
        p.startsWith("/subjects/") ||
        p.startsWith("/programs"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-40 rounded-[20px] bg-card/90 shadow-[var(--shadow-floating)] backdrop-blur-xl ring-1 ring-border/40 lg:hidden"
    >
      <div className="mx-auto grid h-16 max-w-2xl grid-cols-5 items-center px-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn("group relative mx-auto flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2 py-1 transition-colors select-none app-interactive", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95")}
            >
              <Icon
                className={cn(
                  "size-[19px] shrink-0 transition-colors",
                  isActive ? "stroke-[2.2]" : "stroke-[1.8]"
                )}
                aria-hidden="true"
              />
              <span className={cn("max-w-[56px] truncate text-center text-[10px] font-bold leading-none", !isActive && "sr-only")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
