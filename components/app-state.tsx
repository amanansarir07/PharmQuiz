import { AlertCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLoading({
  label = "Loading your study space",
}: {
  label?: string;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-7" role="status" aria-label={label}>
      <p className="mb-6 text-sm font-medium text-muted-foreground">{label}</p>
      <div className="animate-pulse space-y-6" aria-hidden="true"><div className="h-8 w-2/3 max-w-sm rounded-lg bg-muted" /><div className="h-44 rounded-2xl border bg-card" /><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[0, 1, 2, 3].map((key) => <div key={key} className="h-24 rounded-2xl border bg-card" />)}</div><div className="space-y-3">{[0, 1, 2].map((key) => <div key={key} className="h-16 rounded-xl border bg-card" />)}</div></div>
    </div>
  );
}

export function AppEmpty({
  title,
  description,
  action,
  onAction,
}: {
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex min-h-[42vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <BookOpen className="h-6 w-6" />
        </div>
        <h2 className="text-base font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        {action && onAction && (
          <Button className="mt-5" onClick={onAction}>
            {action}
          </Button>
        )}
      </div>
    </div>
  );
}

export function AppError({
  title = "Something went wrong",
  description = "We could not load this page. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[42vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-destructive/20 bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-base font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        {onRetry && (
          <Button className="mt-5" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
