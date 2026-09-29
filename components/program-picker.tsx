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
}: {
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
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
                    const selectable = program.hasContent && !disabled;
                    return (
                      <button
                        key={program.slug}
                        type="button"
                        disabled={!selectable}
                        onClick={() => onChange(program.slug)}
                        title={
                          program.hasContent
                            ? program.description
                            : `${program.name}${program.level ? " " + program.level : ""} — coming soon`
                        }
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all",
                          selected
                            ? "border-primary bg-primary/5 font-medium ring-1 ring-primary"
                            : "hover:bg-muted",
                          !program.hasContent &&
                            "cursor-not-allowed border-dashed text-muted-foreground hover:bg-transparent"
                        )}
                      >
                        <span>{program.icon}</span>
                        {program.shortLabel}
                        {program.hasContent ? (
                          selected && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          )
                        ) : (
                          <Clock className="h-3.5 w-3.5 opacity-50" />
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
