import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AppMain } from "@/components/layout/app-main";
import { Providers } from "@/components/providers";
import { SITE_URL } from "@/lib/site";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const SITE_DESCRIPTION =
  "Practice MCQs for every CTEVT diploma and certificate programme — Pharmacy, PCL Nursing, Health Assistant (HA), Physiotherapy and CMLT — plus the +2 Science, Computer Science and Management streams.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bujh — MCQ Practice for CTEVT & +2 Programmes",
    template: "%s — Bujh",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "CTEVT MCQs",
    "CTEVT entrance preparation",
    "diploma pharmacy MCQs",
    "D.Pharm questions",
    "PCL Nursing MCQs",
    "nursing entrance preparation Nepal",
    "HA MCQs",
    "health assistant MCQ",
    "CMLT MCQs",
    "lab technician MCQ Nepal",
    "physiotherapy entrance MCQs",
    "NEB grade 11 MCQs",
    "NEB grade 12 MCQs",
    "class 11 science MCQ Nepal",
    "class 12 management MCQ",
    "computer science grade 11 MCQ",
    "MCQ practice Nepal",
    "Bujh",
  ],
  applicationName: "Bujh",
  openGraph: {
    type: "website",
    siteName: "Bujh",
    title: "Bujh — MCQ Practice for CTEVT & +2 Programmes",
    description: SITE_DESCRIPTION,
    locale: "en_NP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bujh — MCQ Practice for CTEVT & +2 Programmes",
    description: SITE_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: "Bujh",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#1555f0",
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
          <AppMain>{children}</AppMain>
          <Footer />
          <BottomNav />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
