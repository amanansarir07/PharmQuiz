"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth";
import { ProgramProvider } from "@/lib/program";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <ProgramProvider>{children}</ProgramProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
