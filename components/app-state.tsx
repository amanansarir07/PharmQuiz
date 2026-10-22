import { Button } from "@/components/ui/button";

export function AppLoading({
  label = "Loading your study space",
  variant = "page",
}: {
  label?: string;
  variant?: "page" | "dashboard" | "subjects" | "questions" | "leaderboard" | "notes";
}) {
  const rows = variant === "dashboard" ? 3 : variant === "leaderboard" ? 8 : variant === "subjects" ? 6 : 5;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-7" role="status" aria-label={label}>
      <p className="mb-6 text-sm font-medium text-muted-foreground">{label}</p>
      <div className="motion-safe:animate-pulse space-y-5" aria-hidden="true">
        <div className="h-7 w-2/3 max-w-xs rounded bg-muted" />
        {variant === "dashboard" && <div className="h-40 max-w-2xl rounded-xl border bg-card" />}
        <div className="max-w-3xl divide-y border-y">{Array.from({ length: rows }, (_, key) => <div key={key} className="flex min-h-16 items-center gap-4 py-3"><div className="h-4 w-1/2 rounded bg-muted" /><div className="ml-auto h-3 w-14 rounded bg-muted" /></div>)}</div>
      </div>
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
      <div className="w-full max-w-sm text-center">
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
  actionLabel = "Try again",
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex min-h-[42vh] items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h2 className="text-base font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        {onRetry && (
          <Button className="mt-5" onClick={onRetry}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
