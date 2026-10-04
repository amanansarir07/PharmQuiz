import { AlertCircle, BookOpen, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLoading({
  label = "Loading your study space",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-[52vh] items-center justify-center px-4">
      <div className="w-full max-w-xs text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">This will only take a moment.</p>
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
