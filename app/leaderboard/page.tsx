"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  Medal,
  Target,
  Users,
  RefreshCw,
  Calendar,
  Clock,
  Award,
  Star,
  TrendingUp,
  ArrowUp,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  getLeaderboard,
  getUserLeaderboardPosition,
  type LeaderboardEntry,
  type LeaderboardPeriod,
  type UserLeaderboardPosition,
  PERIOD_LABELS,
  PERIOD_MIN_QUIZZES,
  PERIOD_DESCRIPTIONS,
} from "@/lib/leaderboard";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const periods: { key: LeaderboardPeriod; icon: React.ElementType; color: string }[] = [
  { key: "daily", icon: Calendar, color: "text-blue-500" },
  { key: "weekly", icon: Clock, color: "text-purple-500" },
  { key: "monthly", icon: Award, color: "text-emerald-500" },
  { key: "all_time", icon: Star, color: "text-yellow-500" },
];

const rankStyles: Record<number, string> = {
  1: "bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-l-4 border-yellow-500",
  2: "bg-gradient-to-r from-gray-400/10 to-gray-400/5 border-l-4 border-gray-400",
  3: "bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-l-4 border-amber-500",
};

const rankTextColors: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-gray-400",
  3: "text-amber-500",
};

const rankBadgeStyles: Record<number, string> = {
  1: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  2: "bg-gray-400/10 text-gray-400 border-gray-400/30",
  3: "bg-amber-500/10 text-amber-500 border-amber-500/30",
};

export default function LeaderboardPage() {
  const [activePeriod, setActivePeriod] = useState<LeaderboardPeriod>("all_time");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userPosition, setUserPosition] = useState<UserLeaderboardPosition | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user } = useAuth();

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await getLeaderboard(activePeriod);
      setEntries(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setEntries([]);
    }
  }, [activePeriod]);

  const fetchUserPosition = useCallback(async () => {
    if (!user) {
      setUserPosition(null);
      return;
    }
    try {
      const pos = await getUserLeaderboardPosition(user.id, activePeriod);
      setUserPosition(pos);
    } catch (err) {
      console.error("Failed to fetch user position:", err);
      setUserPosition(null);
    }
  }, [activePeriod, user]);

  useEffect(() => {
    setMounted(true);
    fetchLeaderboard();
    fetchUserPosition();
  }, [fetchLeaderboard, fetchUserPosition]);

  // Real-time subscription
  useEffect(() => {
    try {
      const channel = supabase
        .channel(`leaderboard-${activePeriod}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "quiz_results" },
          () => {
            fetchLeaderboard();
            fetchUserPosition();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn("Realtime subscription failed:", err);
    }
  }, [activePeriod, fetchLeaderboard, fetchUserPosition]);

  // Refresh on focus
  useEffect(() => {
    const handler = () => {
      fetchLeaderboard();
      fetchUserPosition();
    };
    window.addEventListener("focus", handler);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handler();
    });
    return () => window.removeEventListener("focus", handler);
  }, [fetchLeaderboard, fetchUserPosition]);

  const activePeriodInfo = periods.find((p) => p.key === activePeriod)!;
  const ActiveIcon = activePeriodInfo.icon;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              Leaderboard
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Compete with classmates. Score = Accuracy + Volume + Consistency.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsRefreshing(true);
                fetchLeaderboard().finally(() => setIsRefreshing(false));
                fetchUserPosition();
              }}
              disabled={isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="mb-6 flex gap-2 p-1 bg-muted/50 rounded-xl w-fit">
        {periods.map(({ key, icon: PIcon, color }) => (
          <button
            key={key}
            onClick={() => setActivePeriod(key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              activePeriod === key
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <PIcon className={cn("h-4 w-4", activePeriod === key ? color : "")} />
            <span className="hidden sm:inline">{PERIOD_LABELS[key]}</span>
          </button>
        ))}
      </div>

      {/* Your Rank Card */}
      {user && userPosition && (
        <Card className={cn(
          "mb-6 overflow-hidden",
          userPosition.qualified
            ? "border-primary/20"
            : "border-orange-500/20"
        )}>
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-5">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                userPosition.qualified ? "bg-primary/10" : "bg-orange-500/10"
              )}>
                <ActiveIcon className={cn("h-6 w-6", activePeriodInfo.color)} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Your {PERIOD_LABELS[activePeriod]} Rank
                </p>
                {userPosition.qualified ? (
                  <p className="text-2xl font-bold">
                    #{userPosition.rank}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      of {userPosition.totalParticipants} participants
                    </span>
                  </p>
                ) : (
                  <p className="text-2xl font-bold text-muted-foreground">
                    Unranked
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-lg font-bold">{userPosition.quizzesTaken}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Quizzes</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="text-lg font-bold">{userPosition.accuracy}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Accuracy</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {userPosition.qualified ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Qualified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30 gap-1">
                    <ArrowUp className="h-3 w-3" />
                    {userPosition.quizzesNeeded} more
                  </Badge>
                )}
              </div>
            </div>
            <div className="px-5 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      userPosition.qualified ? "bg-green-500" : "bg-orange-500"
                    )}
                    style={{
                      width: `${Math.min(
                        100,
                        (userPosition.quizzesTaken / PERIOD_MIN_QUIZZES[activePeriod]) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {userPosition.quizzesTaken}/{PERIOD_MIN_QUIZZES[activePeriod]} quizzes
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard List */}
      <Card>
        <CardContent className="p-0">
          {!mounted ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-5 bg-muted rounded" />
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-48 bg-muted rounded" />
                  </div>
                  <div className="h-5 w-16 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="font-medium text-muted-foreground">No data yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Complete {PERIOD_MIN_QUIZZES[activePeriod]}+ quizzes to appear on the{" "}
                {PERIOD_LABELS[activePeriod].toLowerCase()} leaderboard
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {entries.map((entry, idx) => {
                const isCurrentUser = user?.email === entry.email;
                const rank = entry.rank;
                const isTop3 = rank <= 3;

                return (
                  <div
                    key={entry.user_id}
                    className={cn(
                      "flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30",
                      rankStyles[rank],
                      isCurrentUser && "bg-primary/5 ring-1 ring-inset ring-primary/20"
                    )}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center shrink-0">
                      {isTop3 ? (
                        <span className={cn("text-lg font-bold", rankTextColors[rank])}>
                          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">
                          #{rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <Avatar
                      className={cn(
                        "h-10 w-10 shrink-0",
                        isCurrentUser && "ring-2 ring-primary"
                      )}
                    >
                      <AvatarFallback className="text-sm font-semibold bg-muted">
                        {entry.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name + Stats */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate">
                          {entry.name}
                        </p>
                        {isCurrentUser && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-primary/30"
                          >
                            You
                          </Badge>
                        )}
                        {isTop3 && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 py-0 h-5",
                              rankBadgeStyles[rank]
                            )}
                          >
                            {rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {entry.quizzesTaken} quizzes
                        </span>
                        <span className="flex items-center gap-1">
                          {entry.accuracy}%
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold tabular-nums">
                        {entry.score}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {entry.totalCorrect}/{entry.totalAttempted} correct
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <p className="font-semibold text-foreground mb-0.5">Score</p>
          <p>Correct x 0.7 + Accuracy x 0.3</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <p className="font-semibold text-foreground mb-0.5">Volume Bonus</p>
          <p>+1 per quiz, up to +10</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <p className="font-semibold text-foreground mb-0.5">Tiebreaker</p>
          <p>Score &gt; Accuracy &gt; Quizzes</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <p className="font-semibold text-foreground mb-0.5">Minimum</p>
          <p>Daily: 1 / Weekly: 5 / Monthly: 10 / All: 20</p>
        </div>
      </div>
    </div>
  );
}
