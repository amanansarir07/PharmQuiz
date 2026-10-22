"use client";

import { usePathname } from "next/navigation";
import { PageTransition } from "@/components/page-transition";

export function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicPage = pathname === "/" || pathname.startsWith("/auth/");
  const activeQuiz = pathname.startsWith("/quiz/") && pathname.split("/").length === 3;
  return <main id="main-content" className={`min-w-0 flex-1 ${publicPage || activeQuiz ? "" : "pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:ml-[244px] lg:pb-0"}`}><PageTransition>{children}</PageTransition></main>;
}
