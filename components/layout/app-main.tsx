"use client";

import { usePathname } from "next/navigation";
import { PageTransition } from "@/components/page-transition";

export function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicPage = pathname === "/" || pathname.startsWith("/auth/");
  const activeQuiz = pathname.startsWith("/quiz/") && pathname.split("/").length === 3;
  return <main className={`flex-1 ${publicPage || activeQuiz ? "" : "pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0"}`}><PageTransition>{children}</PageTransition></main>;
}
