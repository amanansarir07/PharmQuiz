"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useActiveProgram } from "@/lib/program";

export function ProgramSelectAction({ slug, destination = "/subjects", label, secondary = false }: { slug: string; destination?: string; label?: string; secondary?: boolean }) {
  const { programSlug, isChosen, setProgramSlug } = useActiveProgram();
  const router = useRouter();
  const selected = isChosen && slug === programSlug;
  return <button type="button" onClick={() => { if (!selected) setProgramSlug(slug); router.push(destination); }} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold ${secondary ? "bg-card text-foreground" : "border-primary bg-primary text-primary-foreground"}`}>{selected && !label ? <CheckCircle2 className="size-4" /> : null}{label || (selected ? "Continue studying" : isChosen ? "Switch to programme" : "Select programme")}</button>;
}
