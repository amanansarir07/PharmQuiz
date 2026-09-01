import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { GraduationCap, Coffee, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-medium">{APP_NAME}</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-md">
            MCQ Practice Platform for Diploma in Pharmacy 2nd Year. Covering
            Pharmaceutics, Pharmacology, Chemistry, Pharmacognosy,
            Biochemistry, Microbiology, Pharmacotherapeutics, Management, and
            Public Health Pharmacy.
          </p>

          {/* Support */}
          <div className="mt-2 inline-flex items-center gap-3 rounded-lg border bg-card px-5 py-2.5 shadow-sm">
            <Coffee className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Like this app? Buy the developer a coffee via</span>
            <span className="text-sm font-bold text-green-700">eSewa</span>
            <span className="text-xs text-muted-foreground">:</span>
            <span className="text-sm font-mono font-semibold">9703644244</span>
          </div>

          {/* Credits */}
          <div className="mt-2 flex flex-col items-center gap-1">
            <p className="text-xs text-muted-foreground">
              Developed with <Heart className="inline h-3 w-3 text-red-500" /> by{" "}
              <Link
                href="https://amanansarinp.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:text-primary hover:underline transition-colors"
              >
                Aman Ansari
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              For Diploma in Pharmacy 2nd Year students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
