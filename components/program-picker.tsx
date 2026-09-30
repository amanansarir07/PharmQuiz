"use client";

import { getFacultyCatalogue } from "@/data/registry";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock } from "lucide-react";

/**
 * Lets a student choose their programme.
 *
 * Programmes without published content are shown but disabled, so students of
 * upcoming programmes can see theirs exists without being able to select a
 * syllabus that has nothing in it yet.
 */
export function ProgramPicker({
  value,
  onChange,
  disabled = false,
  allowAll = true,
}: {
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
  allowAll?: boolean;
}) {
  const catalogue = getFacultyCatalogue();

  return (
    <div className="space-y-4">
      {catalogue.map(({ faculty, awards }) => (
        <div key={faculty.slug}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {faculty.icon} {faculty.name}
          </p>
          <div className="space-y-3">
            {awards.map((award) => (
              <div key={award.award}>
                <p className="mb-1.5 text-xs text-muted-foreground">
                  {award.award}
                </p>
                <div className="flex flex-wrap gap-2">
                  {award.programs.map((program) => {
                    const selected = program.slug === value;
                    const selectable = (program.hasContent || allowAll) && !disabled;
                    return (
                      <button
                        key={program.slug}
                        type="button"
                        disabled={!selectable}
                        onClick={() => onChange(program.slug)}
                        title={
                          program.hasContent
                            ? program.description
                            : `${program.name}${program.level ? " " + program.level : ""} — in active development`
                        }
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all",
                          selected
                            ? "border-primary bg-primary/10 font-semibold text-primary ring-2 ring-primary/30"
                            : "hover:bg-muted/70 hover:border-primary/30",
                          !program.hasContent && !allowAll &&
                            "cursor-not-allowed border-dashed text-muted-foreground hover:bg-transparent"
                        )}
                      >
                        <span>{program.icon}</span>
                        <span>{program.shortLabel}</span>
                        {program.hasContent ? (
                          <span className="ml-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            Live
                          </span>
                        ) : (
                          <span className="ml-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                            In Dev
                          </span>
                        )}
                        {selected && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
