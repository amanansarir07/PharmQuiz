"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { getProgram, isProgramAvailable } from "@/data/registry";
import { ProgramPicker } from "@/components/program-picker";
import { safeGetItem, safeSetItem } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, CheckCircle2, Clock, ArrowRight } from "lucide-react";

const ONBOARDING_DISMISSED_KEY = "bujh-onboarding-dept-dismissed";

export function OnboardingDepartmentModal() {
  const { user } = useAuth();
  const { programSlug, isChosen, setProgramSlug } = useActiveProgram();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(programSlug || "d-pharm-y3");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      // A choice made on this device is valid while the profile refreshes.
      if (isChosen) {
        setOpen(false);
      } else if (user && !user.programSlug) {
        setOpen(true);
      } else if (safeGetItem(ONBOARDING_DISMISSED_KEY) !== "1") {
        setOpen(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [isChosen, user]);

  if (!mounted) return null;

  const handleConfirm = () => {
    if (!selected || !isAvailable) return;
    setProgramSlug(selected);
    safeSetItem(ONBOARDING_DISMISSED_KEY, "1");
    setOpen(false);
  };

  const handleDismiss = () => {
    safeSetItem(ONBOARDING_DISMISSED_KEY, "1");
    setOpen(false);
  };

  const selectedMeta = getProgram(selected);
  const isAvailable = isProgramAvailable(selected);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl p-6"
        showCloseButton={true}
      >
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Select Your Department
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Bujh customizes every question, syllabus chapter, and mock exam to your specific course.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground flex items-center justify-between">
            <span>Please pick your actual diploma or +2 track:</span>
            {selectedMeta && (
              <span className="font-semibold text-foreground flex items-center gap-1">
                <span>{selectedMeta.icon}</span>
                <span>{selectedMeta.shortLabel}</span>
              </span>
            )}
          </div>

          <div className="rounded-xl border p-4 bg-card/60">
            <ProgramPicker
              value={selected}
              onChange={(slug) => setSelected(slug)}
              allowAll={true}
            />
          </div>

          {/* Status info box */}
          {selectedMeta && (
            <div className="rounded-xl border p-3.5 text-xs bg-muted/20">
              {isAvailable ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    {selectedMeta.name} is fully live with full chapter question banks, mock exams, and analytics.
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400 font-medium">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span>
                      {selectedMeta.name} is in active development (Phase 2).
                    </span>
                    <p className="mt-0.5 font-normal text-muted-foreground text-[11px]">
                      This programme is coming soon. Choose a live programme to start practising now.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Choose later
            </Button>
            <Button
              type="button"
              size="default"
              onClick={handleConfirm}
              disabled={!isAvailable}
              className="gap-2 bg-primary font-semibold"
            >
              <span>Confirm &amp; Continue</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
