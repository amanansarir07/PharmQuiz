import { cn } from "@/lib/utils";

export function BujhMark({ className }: { className?: string }) {
  return <span className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-primary text-primary-foreground shadow-sm", className)}>
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="size-[70%]">
      <path d="M5 8.5c4.3 0 7.4 1.5 11 4.5v15c-3.6-3-6.7-4.5-11-4.5V8.5Zm22 0c-4.3 0-7.4 1.5-11 4.5v15c3.6-3 6.7-4.5 11-4.5V8.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="m16 2 1.6 4.4L22 8l-4.4 1.6L16 14l-1.6-4.4L10 8l4.4-1.6L16 2Z" fill="currentColor" />
    </svg>
  </span>;
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return <span className="inline-flex items-center gap-2.5"><BujhMark /><span className="text-[23px] font-extrabold tracking-[-.06em]">bujh<span className="text-primary">.</span>{!compact && <span className="ml-1 text-sm font-medium tracking-normal text-muted-foreground">app</span>}</span></span>;
}
