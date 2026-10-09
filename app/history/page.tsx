"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen } from "lucide-react";
import { getSubjectName } from "@/data/registry";
import { getQuizHistory, type HistoryEntry } from "@/lib/history";
import { useAuth } from "@/lib/auth";
import { AppEmpty, AppError, AppLoading } from "@/components/app-state";
import { LearningPage, PageHeading } from "@/components/learning-ui";

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      if (!cancelled) {
        setMounted(true);
        setLoadError(false);
      }
    });
    // Device history is immediately available even when cloud sync is slow.
    void getQuizHistory().then((entries) => { if (!cancelled) setHistory(entries); });
    getQuizHistory(user?.id)
      .then((entries) => { if (!cancelled) setHistory(entries); })
      .catch((error) => {
        console.error("Failed to load quiz history:", error);
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [user]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-NP", { timeZone: "Asia/Kathmandu", month: "short", day: "numeric", year: "numeric" });
    } catch { return iso; }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 70) return "text-green-600 dark:text-green-400";
    if (pct >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <LearningPage className="max-w-4xl">
      <PageHeading eyebrow="Your learning record" title="Quiz history" description="Review past practice and mock attempts." />

      {!mounted ? (
        <AppLoading label="Loading your quiz history" />
      ) : loadError ? (
        <AppError
          title="History unavailable"
          description="We could not load your quiz history. Please try again."
          onRetry={() => window.location.reload()}
        />
      ) : history.length === 0 ? (
        <AppEmpty
          title="No quiz history yet"
          description="Complete your first quiz to see your scores and review attempts here."
          action="Start MCQs"
          onAction={() => router.push("/quiz")}
        />
      ) : (
        <>
          <div className="space-y-2.5">
            {history.map((entry) => {
              const percentage = entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0;
              const clickable = entry.hasLocalDetail && entry.localSessionId;
              return (
                <Card
                  key={entry.key}
                  onClick={() => clickable && router.push(`/quiz/${entry.localSessionId}/results`)}
                  className={`rounded-2xl transition-colors hover:border-primary/30 ${clickable ? "cursor-pointer" : ""}`}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10`}>
                      <span className={`text-base font-bold ${getScoreColor(percentage)}`}>{percentage}%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{getSubjectName(entry.subject)}</p>
                        <Badge variant="outline" className="text-xs shrink-0">{entry.correct}/{entry.total}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(entry.completedAt)}
                        {entry.timeTaken && <> · {formatTime(entry.timeTaken)}</>}
                        {!entry.hasLocalDetail && <span className="ml-2 text-muted-foreground/70">(summary — full review available on the device you took it on)</span>}
                      </p>
                    </div>
                    {clickable && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <BookOpen className="inline h-3 w-3 mr-1" />
            History syncs with your account, so it follows you across devices.
          </p>
        </>
      )}
    </LearningPage>
  );
}
