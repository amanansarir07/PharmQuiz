"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, ArrowRight, BookOpen } from "lucide-react";
import { getSubjectName } from "@/lib/stats";
import { getQuizHistory, type HistoryEntry } from "@/lib/history";
import { useAuth } from "@/lib/auth";

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    getQuizHistory(user?.id).then(setHistory);
  }, [user]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-8 w-8" />
          Quiz History
        </h1>
        <p className="mt-2 text-muted-foreground">All your past quiz sessions</p>
      </div>

      {!mounted ? (
        <div className="text-center py-20 text-muted-foreground">Loading history...</div>
      ) : history.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <History className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No quiz history yet</p>
            <p className="text-sm text-muted-foreground mb-4">Complete your first quiz to see it here</p>
            <Link href="/quiz"><Button>Start MCQs</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {history.map((entry) => {
              const percentage = entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0;
              const clickable = entry.hasLocalDetail && entry.localSessionId;
              return (
                <Card
                  key={entry.key}
                  onClick={() => clickable && router.push(`/quiz/${entry.localSessionId}/results`)}
                  className={`transition-all hover:shadow-md ${clickable ? "cursor-pointer" : ""}`}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10`}>
                      <span className={`text-xl font-bold ${getScoreColor(percentage)}`}>{percentage}%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{getSubjectName(entry.subject)}</p>
                        <Badge variant="outline" className="text-xs shrink-0">{entry.correct}/{entry.total}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
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
    </div>
  );
}
