"use client";

import { usePathname } from "next/navigation";
import { PageTransition } from "@/components/page-transition";
import { AppError, AppLoading } from "@/components/app-state";
import { useAuth } from "@/lib/auth";

export function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading, authRestorationTimedOut } = useAuth();
  const publicPage = pathname === "/" || pathname.startsWith("/auth/");
  const dashboardHome = pathname === "/dashboard";
  const activeQuiz = pathname.startsWith("/quiz/") && pathname.split("/").length === 3;
  const quizResults = /^\/quiz\/[^/]+\/results$/.test(pathname);
  const focusedQuizFlow = activeQuiz || quizResults;
  const mobileBottomClearance = publicPage || dashboardHome || focusedQuizFlow ? "" : "pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]";
  const desktopSidebarClearance = publicPage || activeQuiz ? "" : "lg:ml-[244px] lg:pb-0";
  const className = `min-w-0 flex-1 ${mobileBottomClearance} ${desktopSidebarClearance}`;

  // Every in-app route waits for the initial session and profile lookup. This
  // prevents a signed-in student from briefly seeing the guest experience on
  // refresh. Landing and authentication pages remain immediately available.
  if (!publicPage && isLoading) return <main id="main-content" className={className}><AppLoading label="Opening your learning space" variant={pathname === "/dashboard" ? "dashboard" : pathname === "/subjects" ? "subjects" : pathname === "/review" ? "questions" : pathname === "/leaderboard" ? "leaderboard" : pathname === "/notes" ? "notes" : "page"} /></main>;
  if (!publicPage && authRestorationTimedOut) return <main id="main-content" className={className}><AppError title="Could not check your session" description="Please check your connection and try again." onRetry={() => window.location.reload()} /></main>;

  return <main id="main-content" data-home-screen={dashboardHome ? "true" : undefined} className={className}><PageTransition>{children}</PageTransition></main>;
}
