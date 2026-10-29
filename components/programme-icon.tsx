import type { ComponentType } from "react";
import {
  Accessibility,
  BadgeCheck,
  ChartNoAxesCombined,
  Dna,
  GraduationCap,
  HeartPulse,
  Microscope,
  MonitorCog,
  Pill,
  Stethoscope,
  type LucideProps,
} from "lucide-react";
import type { ProgramMeta } from "@/data/types";
import { cn } from "@/lib/utils";

type ProgrammeIdentity = Pick<ProgramMeta, "slug" | "facultySlug">;

const programmeIcons: Record<string, ComponentType<LucideProps>> = {
  "d-pharm-y1": Pill,
  "d-pharm-y2": Pill,
  "d-pharm-y3": Pill,
  "c-pharm": BadgeCheck,
  "pcl-nursing": Stethoscope,
  "health-assistant": HeartPulse,
  "health-assistant-y2": HeartPulse,
  "health-assistant-y3": HeartPulse,
  "d-physiotherapy": Accessibility,
  cmlt: Microscope,
  "plus-two-science-bio": Dna,
  "plus-two-computer": MonitorCog,
  "plus-two-management": ChartNoAxesCombined,
};

/** A consistent, professional programme marker for every Bujh surface. */
export function ProgrammeIcon({
  program,
  className,
  iconClassName,
}: {
  program: ProgrammeIdentity;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = programmeIcons[program.slug] ?? GraduationCap;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
        className
      )}
    >
      <Icon className={cn("size-5", iconClassName)} strokeWidth={2} />
    </span>
  );
}
