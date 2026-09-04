import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import { Coffee, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Image src="/icons/icon-192.png" alt="" width={192} height={192} className="h-6 w-6" />
            <span className="text-sm font-medium">{APP_NAME}</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-md">
            MCQ Practice Platform for Diploma in Pharmacy 2nd Year. Covering
            Pharmaceutics, Pharmacology, Chemistry, Pharmacognosy,
            Biochemistry, Microbiology, Pharmacotherapeutics, Management, and
            Public Health Pharmacy.
          </p>

          {/* Support */}
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2">
            <Coffee className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Support the developer</span>
            <span className="text-xs font-medium text-foreground">eSewa</span>
            <span className="text-xs font-mono font-semibold text-muted-foreground">9703644244</span>
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
              For D. Pharmacy 2nd Year students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
