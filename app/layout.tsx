import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PharmQuiz — Diploma in Pharmacy 2nd Year MCQ Practice",
  description:
    "Practice MCQs for Diploma in Pharmacy 2nd Year examinations. Cover Pharmaceutics, Pharmacology, Chemistry, Pharmacognosy, Biochemistry, Microbiology, Pharmacotherapeutics, Management and Public Health Pharmacy.",
  keywords: [
    "pharmacy MCQs",
    "diploma pharmacy",
    "pharmacy practice",
    "MCQ Practice",
    "Nepal pharmacy exam",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
