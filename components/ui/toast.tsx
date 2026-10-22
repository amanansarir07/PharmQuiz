"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type Tone = "success" | "error" | "info";
type Message = { title: string; description?: string; tone: Tone; id: number };
const eventName = "bujh:toast";

export function toast(title: string, tone: Tone = "info", description?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<Message>(eventName, { detail: { title, tone, description, id: Date.now() } }));
}

export function Toaster() {
  const [message, setMessage] = useState<Message | null>(null);
  useEffect(() => {
    const receive = (event: Event) => setMessage((event as CustomEvent<Message>).detail);
    window.addEventListener(eventName, receive);
    return () => window.removeEventListener(eventName, receive);
  }, []);
  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [message]);
  if (!message) return null;
  const Icon = message.tone === "success" ? CheckCircle2 : message.tone === "error" ? XCircle : Info;
  return <div role={message.tone === "error" ? "alert" : "status"} className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-[100] mx-auto flex max-w-sm items-start gap-3 rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg lg:bottom-5">
    <Icon className={`mt-0.5 size-5 shrink-0 ${message.tone === "error" ? "text-destructive" : message.tone === "success" ? "text-emerald-600" : "text-primary"}`} />
    <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{message.title}</p>{message.description && <p className="mt-0.5 text-xs text-muted-foreground">{message.description}</p>}</div>
    <button type="button" onClick={() => setMessage(null)} aria-label="Dismiss notification" className="-m-1 rounded-lg p-1 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
  </div>;
}
