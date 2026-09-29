"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  BookOpen,
  Target,
  Trophy,
  User,
  LayoutDashboard,
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
      label: "Study",
      href: "/dashboard",
      icon: BookOpen,
      match: (p: string) => p === "/dashboard" || p.startsWith("/subjects"),
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
      label: user ? "Profile" : "Account",
      href: user ? "/profile" : "/auth/login",
      icon: user ? User : LayoutDashboard,
      match: (p: string) => p.startsWith("/profile") || p.startsWith("/auth"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="grid h-14 grid-cols-4 items-center">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
