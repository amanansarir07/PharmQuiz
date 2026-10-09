"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  RefreshCw,
  Calendar,
  Clock,
  Award,
  Star,
} from "lucide-react";
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
import { useActiveProgram } from "@/lib/program";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LearningPage, PageHeading } from "@/components/learning-ui";

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
  const { programSlug, program } = useActiveProgram();

  // Rankings are per programme: a D.Pharm Y2 student competes with their own
  // cohort, not with the whole site. Switching programme re-fetches.
  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await getLeaderboard(activePeriod, programSlug);
      setEntries(data);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      setEntries([]);
    }
  }, [activePeriod, programSlug]);

  const fetchUserPosition = useCallback(async () => {
    if (!user) { setUserPosition(null); return; }
    try {
      const pos = await getUserLeaderboardPosition(user.id, activePeriod, programSlug);
      setUserPosition(pos);
    } catch (err) {
      console.error("User position error:", err);
      setUserPosition(null);
    }
  }, [activePeriod, programSlug, user]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => { setMounted(true); void fetchLeaderboard(); void fetchUserPosition(); });
    return () => cancelAnimationFrame(frame);
  }, [fetchLeaderboard, fetchUserPosition]);

  useEffect(() => {
    try {
      const channel = supabase
        .channel(`lb-${activePeriod}-${programSlug}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "quiz_results" }, () => {
          fetchLeaderboard();
          fetchUserPosition();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } catch {}
  }, [activePeriod, programSlug, fetchLeaderboard, fetchUserPosition]);

  useEffect(() => {
    const h = () => { fetchLeaderboard(); fetchUserPosition(); };
    const onVisibility = () => { if (document.visibilityState === "visible") h(); };
    window.addEventListener("focus", h);
    document.addEventListener("visibilitychange", onVisibility);
    return () => { window.removeEventListener("focus", h); document.removeEventListener("visibilitychange", onVisibility); };
  }, [fetchLeaderboard, fetchUserPosition]);

  const top3 = entries.filter((e) => e.rank <= 3);
  const rest = entries.filter((e) => e.rank > 3);

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = [top3.find((e) => e.rank === 2), top3.find((e) => e.rank === 1), top3.find((e) => e.rank === 3)].filter(Boolean) as LeaderboardEntry[];
  const podiumRanks = [2, 1, 3]; // visual order: left, center, right

  // Podium needs all 3 spots filled; with fewer than 3 ranked users, fall back
  // to showing everyone as plain list rows (otherwise a lone #1 would render nothing).
  const showPodium = podiumOrder.length >= 3;
  const listEntries = showPodium ? rest : entries;

  return (
    <LearningPage className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <PageHeading eyebrow={program.shortLabel} title="Leaderboard" description="See how students in your programme are doing." />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setIsRefreshing(true); fetchLeaderboard().finally(() => setIsRefreshing(false)); fetchUserPosition(); }}
          disabled={isRefreshing}
          className="gap-1.5 text-muted-foreground"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Period Tabs */}
      <div className="mb-7 grid grid-cols-4 gap-1 rounded-xl bg-muted/70 p-1">
        {periods.map(({ key, icon: PIcon }) => (
          <button
            key={key}
            onClick={() => setActivePeriod(key)}
            className={cn(
              "flex min-h-11 items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold transition-all sm:text-xs",
              activePeriod === key
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <PIcon className="hidden size-3.5 sm:block" />
            <span>{PERIOD_LABELS[key]}</span>
          </button>
        ))}
      </div>

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
            Complete {PERIOD_MIN_QUIZZES[activePeriod]}+ quizzes in{" "}
            {program.name} to appear here
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {showPodium && (
            <div className="mb-8 flex items-end justify-center gap-2 sm:gap-4">
              {podiumOrder.map((entry, visualIdx) => {
                const rank = podiumRanks[visualIdx];
                const cfg = podiumConfig[rank - 1];
                const isCenter = rank === 1;
                const isMe = user?.id === entry.user_id;

                return (
                  <div key={entry.user_id} className={cn("flex flex-col items-center", isCenter ? "order-2" : visualIdx === 0 ? "order-1" : "order-3")}>
                    {/* Avatar */}
                    <div className={cn("relative mb-2", isCenter && "-mt-4")}>
                      <div className={cn("rounded-full ring-2", cfg.ring, cfg.avatarSize, "flex items-center justify-center bg-primary/10")}>
                        <Avatar className={cn(cfg.avatarSize, "border-0")}>
                          <AvatarFallback className={cn("bg-transparent text-foreground font-bold", cfg.textSize)}>
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
                    <div className={cn("mt-2 w-20 rounded-t-xl border border-b-0 bg-primary/10 sm:w-24", cfg.height)} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Rest of entries */}
          {listEntries.length > 0 && (
            <div className="overflow-hidden rounded-2xl border bg-card divide-y">
              {listEntries.map((entry) => {
                const isMe = user?.id === entry.user_id;
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

          {/* Sticky Floating User Position Banner */}
          {!user && <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm"><p className="font-semibold">Join your programme rankings</p><p className="mt-1 text-muted-foreground">Create an account to save scores and qualify for the leaderboard.</p><Link href="/auth/register" className="mt-2 inline-flex font-semibold text-primary">Create free account</Link></div>}
          {user && userPosition && (
            <div className="sticky bottom-20 sm:bottom-6 z-20 mt-6 rounded-2xl border-2 border-primary/40 bg-card p-3.5 shadow-xl transition-all">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-black text-primary-foreground shadow-xs">
                    {userPosition.qualified ? `#${userPosition.rank}` : "—"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold truncate">{user.name}</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/30">
                        You
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {userPosition.qualified
                        ? `${userPosition.quizzesTaken} quizzes · ${userPosition.accuracy}% accuracy`
                        : `${userPosition.quizzesNeeded} more quiz${userPosition.quizzesNeeded > 1 ? "zes" : ""} needed to qualify`}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {userPosition.qualified ? (
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block">Standing</span>
                      <span className="text-xs font-bold text-primary">
                        Top {Math.max(1, Math.round((userPosition.rank / Math.max(1, userPosition.totalParticipants)) * 100))}%
                      </span>
                    </div>
                  ) : (
                    <Link
                      href="/quiz"
                      className={cn(buttonVariants({ size: "sm" }), "text-xs font-semibold h-8 px-3")}
                    >
                      Play Now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </LearningPage>
  );
}
