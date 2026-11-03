"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { safeGetItem, safeSetItem } from "@/lib/storage";

const DISMISSED_UNTIL_KEY = "bujh-install-prompt-dismissed-until";
const DISMISS_DAYS = 30;

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppPrompt() {
  const [visible, setVisible] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const installed = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const dismissedUntil = Number(safeGetItem(DISMISSED_UNTIL_KEY) || 0);
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const frame = requestAnimationFrame(() => {
      setVisible(!installed && Date.now() > dismissedUntil);
      setIsIos(ios);
    });

    const onBeforeInstall = (event: Event) => {
      if (installed || Number(safeGetItem(DISMISSED_UNTIL_KEY) || 0) > Date.now()) return;
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setVisible(false);
      setInstallEvent(null);
      setShowInstructions(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    safeSetItem(DISMISSED_UNTIL_KEY, String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000));
    setVisible(false);
  };

  const install = async () => {
    if (!installEvent) {
      setShowInstructions(true);
      return;
    }
    setInstalling(true);
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
      setInstallEvent(null);
      dismiss();
    } catch {
      setInstallEvent(null);
      setShowInstructions(true);
    } finally {
      setInstalling(false);
    }
  };

  if (!visible) return null;

  return <>
    <div className="h-24" aria-hidden="true" />
    <aside aria-label="Add Bujh to your home screen" className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-30 mx-auto flex max-w-md items-center gap-2.5 rounded-xl border bg-card p-3 text-card-foreground shadow-[var(--shadow-floating)] lg:inset-x-auto lg:bottom-6 lg:right-6 lg:mx-0 lg:w-[420px]">
      <Image src="/icons/icon-192.png" alt="" width={44} height={44} className="size-11 shrink-0 rounded-lg border object-cover" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-5">Install Bujh</p>
        <p className="text-xs leading-4 text-muted-foreground"><span className="lg:hidden">Open practice in one tap.</span><span className="hidden lg:inline">Open practice in one click.</span></p>
      </div>
      <Button type="button" size="sm" className="min-h-10 shrink-0 gap-1.5 rounded-lg px-2.5 text-xs" disabled={installing} onClick={install}>
        <Download className="size-4" aria-hidden="true" />
        {installing ? "Opening…" : installEvent ? "Install" : "How to add"}
      </Button>
      <button type="button" aria-label="Dismiss install suggestion" onClick={dismiss} className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <X className="size-4" aria-hidden="true" />
      </button>
    </aside>
    <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Bujh to your home screen</DialogTitle>
          <DialogDescription>Open your practice space with one tap.</DialogDescription>
        </DialogHeader>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-6">
          {isIos ? <>
            <li>Tap the Share button in your browser.</li>
            <li>Choose Add to Home Screen, then tap Add.</li>
          </> : <>
            <li>Open your browser menu.</li>
            <li>Choose Install app or Add to Home screen.</li>
          </>}
        </ol>
        <Button type="button" onClick={() => setShowInstructions(false)}>Got it</Button>
      </DialogContent>
    </Dialog>
  </>;
}
