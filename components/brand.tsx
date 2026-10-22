import { cn } from "@/lib/utils";
import Image from "next/image";

export function BujhMark({ className }: { className?: string }) {
  return <span className={cn("inline-flex size-10 shrink-0 items-center justify-center", className)}><Image src="/brand/bujh-mark.png" alt="" width={290} height={330} className="h-full w-full object-contain" /></span>;
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={cn("inline-flex items-center", compact ? "h-8" : "h-9")}><Image src="/brand/bujh-wordmark.png" alt="Bujh" width={910} height={335} className="h-full w-auto object-contain dark:hidden" /><Image src="/brand/bujh-wordmark-dark.png" alt="" width={910} height={335} className="hidden h-full w-auto object-contain dark:block" /></span>;
}
