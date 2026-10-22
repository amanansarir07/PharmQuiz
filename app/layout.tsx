import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AppMain } from "@/components/layout/app-main";
import { Providers } from "@/components/providers";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bujh — MCQ Practice & Revision in Nepal",
    template: "%s — Bujh",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "CTEVT MCQs",
    "diploma pharmacy MCQs",
    "D.Pharm Year 2 MCQs",
    "D.Pharm Year 3 MCQs",
    "CTEVT mock exams",
    "+2 programmes coming soon",
    "MCQ practice Nepal",
    "Bujh",
  ],
  applicationName: "Bujh",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Bujh",
    title: "Bujh — MCQ Practice & Revision in Nepal",
    description: SITE_DESCRIPTION,
    locale: "en_NP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bujh — MCQ Practice & Revision in Nepal",
    description: SITE_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: "Bujh",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#315cf5",
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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-primary focus:p-3 focus:text-primary-foreground">Skip to content</a>
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
