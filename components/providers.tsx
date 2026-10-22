"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth";
import { ProgramProvider } from "@/lib/program";
import { Toaster } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <ProgramProvider>{children}<Toaster /></ProgramProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
