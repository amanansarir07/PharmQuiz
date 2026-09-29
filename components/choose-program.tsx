"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ProgramPicker } from "@/components/program-picker";
import { useActiveProgram } from "@/lib/program";
import { safeGetItem, safeSetItem } from "@/lib/storage";
import { GraduationCap, X } from "lucide-react";

const DISMISS_KEY = "bujh-program-prompt-dismissed";
const DISMISS_EVENT = "bujh-program-prompt-dismissed-change";

function subscribeDismissed(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(DISMISS_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(DISMISS_EVENT, onChange);
  };
}

function getDismissed(): boolean {
  return safeGetItem(DISMISS_KEY) === "1";
}

// Server and first client paint both say "dismissed", so the prompt never
// flickers in front of a student who already has a programme. It appears only
// once we can actually read their device.
function getDismissedOnServer(): boolean {
  return true;
}

/**
 * First-run programme prompt.
 *
 * Until a student tells us which programme they are in, the app can only guess
 * — and guessing is how a PCL Nursing student ends up looking at pharmaceutics.
 * This asks once, on the home page, and disappears the moment a choice exists
 * (or the student dismisses it).
 */
export function ChooseProgram() {
  const { isChosen, setProgramSlug } = useActiveProgram();
  const dismissed = useSyncExternalStore(
    subscribeDismissed,
    getDismissed,
    getDismissedOnServer
  );
  if (isChosen || dismissed) return null;

  const dismiss = () => {
    safeSetItem(DISMISS_KEY, "1");
    window.dispatchEvent(new Event(DISMISS_EVENT));
  };

  return (
    <section className="border-b bg-primary/[0.04]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold">
                Which programme are you studying?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Bujh is built around your syllabus — pick your programme and
                every subject, question and leaderboard follows.
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="-mr-1 -mt-1 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5">
            <ProgramPicker value="" onChange={setProgramSlug} />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Not listed? Your programme is probably on the way.
            </p>
            <Link
              href="/programs"
              className="text-sm font-medium text-primary hover:underline"
            >
              See all programmes →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
