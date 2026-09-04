import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/page-transition";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bujh — D. Pharmacy 2nd Year MCQ Practice",
  description:
    "Practice MCQs for D. Pharmacy 2nd year CTEVT examinations. Cover Pharmaceutics, Pharmacology, Chemistry, Pharmacognosy, Biochemistry, Microbiology, Pharmacotherapeutics, Management and Public Health Pharmacy.",
  keywords: [
    "pharmacy MCQs",
    "diploma pharmacy",
    "pharmacy practice",
    "MCQ Practice",
    "Nepal pharmacy exam",
  ],
  applicationName: "Bujh",
  appleWebApp: {
    capable: true,
    title: "Bujh",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <Navbar />
          <main className="flex-1"><PageTransition>{children}</PageTransition></main>
          <Footer />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
