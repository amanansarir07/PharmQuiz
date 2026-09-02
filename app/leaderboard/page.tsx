"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, Medal, Target, Users, RefreshCw, Calendar, Clock, Award, Star, TrendingUp, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getLeaderboard, getUserLeaderboardPosition, type LeaderboardEntry, type LeaderboardPeriod, type UserLeaderboardPosition, PERIOD_LABELS, PERIOD_MIN_QUIZZES, PERIOD_DESCRIPTIONS } from "@/lib/leaderboard";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const periodIconMap: Record<LeaderboardPeriod, React.ElementType> = {
  daily: Calendar,
  weekly: Clock,
  monthly: Award,
  all_time: Star,
};

const periodColors: Record<LeaderboardPeriod, string> = {
  daily: "bg-blue-500",
  weekly: "bg-purple-500",
  monthly: "bg-emerald-500",
  all_time: "bg-yellow-500",
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
    const data = await getLeaderboard(activePeriod);
    setEntries(data);
    setLastUpdated(new Date());
  }, [activePeriod]);

  const fetchUserPosition = useCallback(async () => {
    if (!user) {
      setUserPosition(null);
      return;
    }
    const pos = await getUserLeaderboardPosition(user.id, activePeriod);
    setUserPosition(pos);
  }, [activePeriod, user]);

  useEffect(() => {
    setMounted(true);
    fetchLeaderboard();
    fetchUserPosition();
  }, [fetchLeaderboard, fetchUserPosition]);

  // Real-time subscription to quiz_results table
  useEffect(() => {
    const channel = supabase
      .channel(`leaderboard-${activePeriod}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "quiz_results",
        },
        () => {
          fetchLeaderboard();
          fetchUserPosition();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activePeriod, fetchLeaderboard, fetchUserPosition]);

  // Refresh when page becomes visible
  useEffect(() => {
    const handler = () => {
      fetchLeaderboard();
      fetchUserPosition();
    };
    window.addEventListener("focus", handler);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handler();
    });
    return () => {
      window.removeEventListener("focus", handler);
    };
  }, [fetchLeaderboard, fetchUserPosition]);

  const Icon = periodIconMap[activePeriod];
  const periodColor = periodColors[activePeriod];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Trophy className="h-9 w-9 text-yellow-500" />
              Leaderboard
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Compete with classmates across different time periods. Rankings are based on a fair score combining accuracy, correct answers, and quiz volume.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setIsRefreshing(true); fetchLeaderboard().finally(() => setIsRefreshing(false)); fetchUserPosition(); }}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Period Tabs */}
        <Tabs value={activePeriod} onValueChange={setActivePeriod} className="w-full">
          <TabsList className="grid w-full grid-cols-4 gap-1 bg-muted p-1 rounded-xl">
            {(["daily", "weekly", "monthly", "all_time"] as LeaderboardPeriod[]).map((period) => (
              <TabsTrigger
                key={period}
                value={period}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 py-3 px-2 text-sm transition-all",
                  "data-[state=active]:shadow-md data-[state=active]:bg-background"
                )}
              >
                <div className="flex items-center gap-1.5">
                  {(() => { const Icon = periodIconMap[period]; return <Icon className="h-4 w-4" />; })()}
                  <span className="font-medium">{PERIOD_LABELS[period]}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>Min: {PERIOD_MIN_QUIZZES[period]}</span>
                </div>
                {activePeriod === period && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-primary" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* User Position Card */}
      {user && userPosition && (
        <Card className={cn("mb-6 transition-all duration-300", userPosition.qualified 
          ? "border-primary/20 bg-gradient-to-r from-primary/5 to-transparent" 
          : "border-orange-200 bg-gradient-to-r from-orange-50 to-transparent"
        )}>
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", periodColor + "/10")}>
                  <Icon className="h-7 w-7" style={{ color: `var(--${periodColor})` }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Your {PERIOD_LABELS[activePeriod]} Rank
                  </p>
                  {userPosition.qualified ? (
                    <p className="text-3xl font-bold text-primary flex items-center gap-2">
                      <span>#{userPosition.rank}</span>
                      <span className="text-lg font-normal text-muted-foreground">/ {userPosition.totalParticipants}</span>
                    </p>
                  ) : (
                    <p className="text-3xl font-bold text-muted-foreground flex items-center gap-2">
                      Unranked
                      <span className="text-lg font-normal text-orange-500">({userPosition.quizzesTaken}/{PERIOD_MIN_QUIZZES[activePeriod]})</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full", userPosition.qualified ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700")}>
                  <div className="flex items-center gap-1">
                    <Target className="h-3.5 w-3.5" />
                    <span>{userPosition.quizzesTaken} / {PERIOD_MIN_QUIZZES[activePeriod]} MCQs</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                  <Award className="h-3.5 w-3.5" />
                  <span>{userPosition.accuracy}% accuracy</span>
                </div>
                {!userPosition.qualified && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300 gap-1">
                    <ArrowUp className="h-3 w-3" />
                    Need {userPosition.quizzesNeeded} more
                  </Badge>
                )}
                {userPosition.qualified && (
                  <Badge variant="default" className="text-green-600 bg-green-50 border-green-200 gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Qualified
                  </Badge>
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{PERIOD_DESCRIPTIONS[activePeriod]}</p>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Content */}
      <TabsContent value="daily" className="space-y-4">
        <LeaderboardContent entries={entries} user={user} period="daily" isMounted={mounted} />
      </TabsContent>
      <TabsContent value="weekly" className="space-y-4">
        <LeaderboardContent entries={entries} user={user} period="weekly" isMounted={mounted} />
      </TabsContent>
      <TabsContent value="monthly" className="space-y-4">
        <LeaderboardContent entries={entries} user={user} period="monthly" isMounted={mounted} />
      </TabsContent>
      <TabsContent value="all_time" className="space-y-4">
        <LeaderboardContent entries={entries} user={user} period="all_time" isMounted={mounted} />
      </TabsContent>

      {/* Scoring Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            How Ranking Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium mb-1">Score Formula</p>
              <p className="text-muted-foreground text-xs">
                (Correct × 0.7) + (Accuracy% × 0.3) + (Volume Bonus up to 10)
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium mb-1">Tiebreakers</p>
              <p className="text-muted-foreground text-xs">
                1. Higher Score → 2. Higher Accuracy → 3. More Quizzes
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Daily: 1+ quiz
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Weekly: 5+ quizzes
            </Badge>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Monthly: 10+ quizzes
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              All-Time: 20+ quizzes
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{PERIOD_DESCRIPTIONS[activePeriod]}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardContent({
  entries,
  user,
  period,
  isMounted,
}: {
  entries: LeaderboardEntry[];
  user: { id: string; email: string; name: string } | null;
  period: LeaderboardPeriod;
  isMounted: boolean;
}) {
  const qualifiedEntries = entries.filter(e => e.qualified);
  const unqualifiedEntries = entries.filter(e => !e.qualified);

  if (!isMounted) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[...Array(5)].map((_, i) => (
              <LeaderboardSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="mx-auto h-14 w-14 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium mb-1">No data yet for {PERIOD_LABELS[period].toLowerCase()}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Complete MCQs to appear on the leaderboard
          </p>
          <div className="text-xs text-muted-foreground">
            Minimum {PERIOD_MIN_QUIZZES[period]} quiz{PERIOD_MIN_QUIZZES[period] !== 1 ? "s" : ""} required
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {qualifiedEntries.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Qualified Rankings <span className="text-normal font-normal text-muted-foreground">({qualifiedEntries.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {qualifiedEntries.map((entry, index) => (
                  <LeaderboardRow
                    key={entry.user_id}
                    entry={entry}
                    isCurrentUser={user?.email === entry.email}
                    showRank={true}
                    index={index}
                  />
                ))}
              </div>
          </CardContent>
        </Card>
      )}

      {unqualifiedEntries.length > 0 && (
        <Card className="border-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-500" />
              Working Towards Ranking <span className="text-normal font-normal text-muted-foreground">({unqualifiedEntries.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[300px] overflow-y-auto">
              {unqualifiedEntries.map((entry, index) => (
                  <LeaderboardRow
                    key={entry.user_id}
                    entry={entry}
                    isCurrentUser={user?.email === entry.email}
                    showRank={false}
                    index={index}
                  />
                ))}
              </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function LeaderboardRow({
  entry,
  isCurrentUser,
  showRank,
  index,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  showRank: boolean;
  index: number;
}) {

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-5 py-4 transition-all duration-200",
        "hover:bg-muted/30",
        entry.rank === 1 && "bg-yellow-50/50 border-l-4 border-yellow-500",
        entry.rank === 2 && "bg-gray-50/50 border-l-4 border-gray-400",
        entry.rank === 3 && "bg-amber-50/50 border-l-4 border-amber-500",
        isCurrentUser && "bg-blue-50/50 border-l-4 border-blue-500 ring-1 ring-blue-200",
        !showRank && "opacity-60"
      )}
    >
      <div className="w-10 flex justify-center">
        {showRank ? (
          <span className={cn(
            "font-bold text-sm",
            entry.rank === 1 && "text-yellow-600",
            entry.rank === 2 && "text-gray-500",
            entry.rank === 3 && "text-amber-600"
          )}>
            #{entry.rank}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground font-medium">—</span>
        )}
      </div>

      <Avatar className={cn("h-10 w-10 shrink-0", isCurrentUser && "ring-2 ring-blue-500")}>
        <AvatarFallback className="text-sm font-medium">
          {entry.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium truncate">{entry.name}</p>
          {isCurrentUser && <Badge variant="secondary" className="text-xs gap-1"><Star className="h-3 w-3" /> You</Badge>}
          {entry.rank === 1 && <Badge variant="default" className="text-xs gap-1 bg-yellow-500 text-yellow-900"><Trophy className="h-3 w-3" /> 1st</Badge>}
          {entry.rank === 2 && <Badge variant="secondary" className="text-xs gap-1 bg-gray-400"><Medal className="h-3 w-3" /> 2nd</Badge>}
          {entry.rank === 3 && <Badge variant="secondary" className="text-xs gap-1 bg-amber-500"><Medal className="h-3 w-3" /> 3rd</Badge>}
          {!showRank && !entry.qualified && (
            <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
              Unranked
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted">
            <Target className="h-3 w-3" />
            {entry.quizzesTaken} MCQs
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted">
            <Award className="h-3 w-3" />
            {entry.accuracy}% acc
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            <TrendingUp className="h-3 w-3" />
            Score: {entry.score}
          </span>
          {!entry.qualified && (
            <Badge variant="secondary" className="ml-auto text-xs gap-1">
              <ArrowUp className="h-3 w-3" />
              Need {entry.quizzesNeeded} more
            </Badge>
          )}
        </div>
      </div>

      <div className="text-right shrink-0 w-28">
        <p className="font-bold text-lg tabular-nums">{entry.totalCorrect}</p>
        <p className="text-xs text-muted-foreground">correct</p>
        <p className="text-xs text-muted-foreground">/ {entry.totalAttempted} total</p>
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="h-5 w-8 bg-muted rounded" />
      <div className="h-10 w-10 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="flex gap-2">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-3 w-28 bg-muted rounded" />
        </div>
      </div>
      <div className="h-6 w-16 bg-muted rounded" />
    </div>
  );
}