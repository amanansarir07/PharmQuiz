"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  Users,
  RefreshCw,
  Calendar,
  Clock,
  Award,
  Star,
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
} from "@/lib/leaderboard";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const periods: { key: LeaderboardPeriod; icon: React.ElementType }[] = [
  { key: "daily", icon: Calendar },
  { key: "weekly", icon: Clock },
  { key: "monthly", icon: Award },
  { key: "all_time", icon: Star },
];

const podiumConfig = [
  { bg: "from-yellow-500 to-amber-500", ring: "ring-yellow-500", medal: "🥇", label: "1st", height: "h-28", avatarSize: "h-16 w-16", textSize: "text-2xl" },
  { bg: "from-slate-300 to-slate-400", ring: "ring-slate-400", medal: "🥈", label: "2nd", height: "h-20", avatarSize: "h-14 w-14", textSize: "text-xl" },
  { bg: "from-amber-600 to-orange-500", ring: "ring-amber-500", medal: "🥉", label: "3rd", height: "h-16", avatarSize: "h-12 w-12", textSize: "text-lg" },
];

export default function LeaderboardPage() {
  const [activePeriod, setActivePeriod] = useState<LeaderboardPeriod>("all_time");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userPosition, setUserPosition] = useState<UserLeaderboardPosition | null>(null);
  const { user } = useAuth();

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await getLeaderboard(activePeriod);
      setEntries(data);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      setEntries([]);
    }
  }, [activePeriod]);

  const fetchUserPosition = useCallback(async () => {
    if (!user) { setUserPosition(null); return; }
    try {
      const pos = await getUserLeaderboardPosition(user.id, activePeriod);
      setUserPosition(pos);
    } catch (err) {
      console.error("User position error:", err);
      setUserPosition(null);
    }
  }, [activePeriod, user]);

  useEffect(() => {
    setMounted(true);
    fetchLeaderboard();
    fetchUserPosition();
  }, [fetchLeaderboard, fetchUserPosition]);

  useEffect(() => {
    try {
      const channel = supabase
        .channel(`lb-${activePeriod}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "quiz_results" }, () => {
          fetchLeaderboard();
          fetchUserPosition();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } catch {}
  }, [activePeriod, fetchLeaderboard, fetchUserPosition]);

  useEffect(() => {
    const h = () => { fetchLeaderboard(); fetchUserPosition(); };
    window.addEventListener("focus", h);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") h(); });
    return () => window.removeEventListener("focus", h);
  }, [fetchLeaderboard, fetchUserPosition]);

  const top3 = entries.filter((e) => e.rank <= 3);
  const rest = entries.filter((e) => e.rank > 3);

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = [top3.find((e) => e.rank === 2), top3.find((e) => e.rank === 1), top3.find((e) => e.rank === 3)].filter(Boolean) as LeaderboardEntry[];
  const podiumRanks = [2, 1, 3]; // visual order: left, center, right

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setIsRefreshing(true); fetchLeaderboard().finally(() => setIsRefreshing(false)); fetchUserPosition(); }}
          disabled={isRefreshing}
          className="gap-1.5 text-muted-foreground"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Period Tabs */}
      <div className="mb-8 grid grid-cols-4 gap-1.5 p-1 bg-muted/50 rounded-xl">
        {periods.map(({ key, icon: PIcon }) => (
          <button
            key={key}
            onClick={() => setActivePeriod(key)}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-xs font-medium transition-all",
              activePeriod === key
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <PIcon className="h-4 w-4" />
            <span>{PERIOD_LABELS[key]}</span>
          </button>
        ))}
      </div>

      {/* Your Rank */}
      {user && userPosition && (
        <div className={cn(
          "mb-8 flex items-center gap-4 rounded-2xl border p-4",
          userPosition.qualified
            ? "bg-primary/5 border-primary/20"
            : "bg-orange-500/5 border-orange-500/20"
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
            {userPosition.qualified ? `#${userPosition.rank}` : "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">
              {userPosition.qualified ? "Your Rank" : "Not ranked yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {userPosition.quizzesTaken} quizzes &middot; {userPosition.accuracy}% accuracy
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-px bg-border" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {userPosition.qualified
                  ? `${userPosition.rank}/${userPosition.totalParticipants}`
                  : `${userPosition.quizzesNeeded} more to qualify`}
              </p>
            </div>
          </div>
        </div>
      )}

      {!mounted ? (
        /* Skeleton */
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl animate-pulse bg-muted/30">
              <div className="w-8 h-5 bg-muted rounded" />
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 bg-muted rounded" />
                <div className="h-3 w-36 bg-muted rounded" />
              </div>
              <div className="h-6 w-14 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        /* Empty state */
        <div className="py-16 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-muted-foreground">No rankings yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Complete {PERIOD_MIN_QUIZZES[activePeriod]}+ quizzes to appear here
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {podiumOrder.length >= 3 && (
            <div className="mb-8 flex items-end justify-center gap-2 sm:gap-4">
              {podiumOrder.map((entry, visualIdx) => {
                const rank = podiumRanks[visualIdx];
                const cfg = podiumConfig[rank - 1];
                const isCenter = rank === 1;
                const isMe = user?.email === entry.email;

                return (
                  <div key={entry.user_id} className={cn("flex flex-col items-center", isCenter ? "order-2" : visualIdx === 0 ? "order-1" : "order-3")}>
                    {/* Avatar */}
                    <div className={cn("relative mb-2", isCenter && "-mt-4")}>
                      <div className={cn("rounded-full ring-2", cfg.ring, cfg.avatarSize, "flex items-center justify-center bg-gradient-to-br", cfg.bg)}>
                        <Avatar className={cn(cfg.avatarSize, "border-0")}>
                          <AvatarFallback className={cn("bg-transparent text-white font-bold", cfg.textSize)}>
                            {entry.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-lg">
                        {cfg.medal}
                      </span>
                    </div>

                    {/* Name */}
                    <p className={cn("font-semibold text-xs sm:text-sm text-center max-w-[90px] truncate", isMe && "text-primary")}>
                      {entry.name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                      {entry.score} pts
                    </p>

                    {/* Bar */}
                    <div className={cn("w-16 sm:w-24 rounded-t-lg mt-2 bg-gradient-to-t", cfg.bg, cfg.height, "opacity-80")} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Rest of entries */}
          {rest.length > 0 && (
            <div className="rounded-xl border divide-y overflow-hidden">
              {rest.map((entry) => {
                const isMe = user?.email === entry.email;
                return (
                  <div
                    key={entry.user_id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30",
                      isMe && "bg-primary/5"
                    )}
                  >
                    <span className="w-7 text-center text-sm font-semibold text-muted-foreground shrink-0">
                      #{entry.rank}
                    </span>
                    <Avatar className={cn("h-9 w-9 shrink-0", isMe && "ring-2 ring-primary")}>
                      <AvatarFallback className="text-xs font-semibold bg-muted">
                        {entry.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{entry.name}</p>
                        {isMe && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/30">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {entry.quizzesTaken} quizzes &middot; {entry.accuracy}%
                      </p>
                    </div>
                    <span className="text-base font-bold tabular-nums shrink-0">
                      {entry.score}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* You at bottom if ranked > 3 */}
          {user && userPosition && userPosition.qualified && userPosition.rank > 3 && (
            <div className="mt-3 rounded-xl border bg-primary/5 p-3 flex items-center gap-3">
              <span className="w-7 text-center text-sm font-bold text-primary shrink-0">
                #{userPosition.rank}
              </span>
              <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary">
                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                  {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{user.name} <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/30">You</Badge></p>
                <p className="text-xs text-muted-foreground">{userPosition.quizzesTaken} quizzes &middot; {userPosition.accuracy}%</p>
              </div>
              <span className="text-base font-bold tabular-nums shrink-0">—</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
