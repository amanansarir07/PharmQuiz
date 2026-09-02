"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, Medal, Target, Users, RefreshCw, Calendar, Clock, Award, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getLeaderboard, getUserLeaderboardPosition, type LeaderboardEntry, type LeaderboardPeriod, type UserLeaderboardPosition, PERIOD_LABELS, PERIOD_MIN_QUIZZES, PERIOD_DESCRIPTIONS } from "@/lib/leaderboard";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
};

const periodIcons: Record<LeaderboardPeriod, typeof Calendar> = {
  daily: Calendar,
  weekly: Clock,
  monthly: Award,
  all_time: Star,
};

export default function LeaderboardPage() {
  const [activePeriod, setActivePeriod] = useState<LeaderboardPeriod>("all_time");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userPosition, setUserPosition] = useState<UserLeaderboardPosition | null>(null);
  const { user } = useAuth();

  const fetchLeaderboard = useCallback(async () => {
    const data = await getLeaderboard(activePeriod);
    setEntries(data);
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

  const Icon = periodIcons[activePeriod];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            See how you rank among your classmates
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setIsRefreshing(true); fetchLeaderboard().finally(() => setIsRefreshing(false)); fetchUserPosition(); }}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* User Position Card */}
      {user && userPosition && (
        <Card className={`mb-6 ${userPosition.qualified ? "" : "border-orange-300 bg-orange-50"}`}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Your {PERIOD_LABELS[activePeriod]} Rank
                  </p>
                  {userPosition.qualified ? (
                    <p className="text-3xl font-bold text-primary">
                      #{userPosition.rank} / {userPosition.totalParticipants}
                    </p>
                  ) : (
                    <p className="text-3xl font-bold text-muted-foreground">
                      Unranked
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{userPosition.quizzesTaken} / {PERIOD_MIN_QUIZZES[activePeriod]} MCQs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{userPosition.accuracy}% accuracy</span>
                </div>
                {!userPosition.qualified && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    Need {userPosition.quizzesNeeded} more quiz{userPosition.quizzesNeeded !== 1 ? "s" : ""}
                  </Badge>
                )}
                {userPosition.qualified && (
                  <Badge variant="default" className="text-green-600 bg-green-50 border-green-200">
                    Qualified
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Period Tabs */}
      <Tabs value={activePeriod} onValueChange={setActivePeriod} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          {(["daily", "weekly", "monthly", "all_time"] as LeaderboardPeriod[]).map((period) => (
            <TabsTrigger key={period} value={period} className="flex flex-col items-center gap-1 py-3">
              <span className="font-medium">{PERIOD_LABELS[period]}</span>
              <span className="text-xs text-muted-foreground">
                Min: {PERIOD_MIN_QUIZZES[period]} quiz{PERIOD_MIN_QUIZZES[period] !== 1 ? "s" : ""}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

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
      </Tabs>

      {/* How scoring works */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            How Ranking Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Score Formula:</strong> (Correct Answers × 0.7) + (Accuracy % × 0.3) + (Quiz Volume Bonus up to 10)</p>
          <p><strong>Minimum Quizzes:</strong> Daily: 1 • Weekly: 5 • Monthly: 10 • All-Time: 20</p>
          <p><strong>Ranking:</strong> Qualified users ranked by score. Unranked users (below minimum) shown at bottom.</p>
          <p><strong>Tiebreakers:</strong> Higher accuracy → More quizzes taken.</p>
          <p className="text-xs">{PERIOD_DESCRIPTIONS[activePeriod]}</p>
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
      <div className="text-center py-20 text-muted-foreground">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        Loading {PERIOD_LABELS[period].toLowerCase()} leaderboard...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No quiz data yet for this period</p>
          <p className="text-sm text-muted-foreground">
            Complete MCQs to appear on the {PERIOD_LABELS[period].toLowerCase()} leaderboard
          </p>
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
              Qualified Rankings ({qualifiedEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {qualifiedEntries.map((entry) => (
                <LeaderboardRow
                  key={entry.user_id}
                  entry={entry}
                  isCurrentUser={user?.email === entry.email}
                  showRank={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {unqualifiedEntries.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              Working Towards Ranking ({unqualifiedEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {unqualifiedEntries.map((entry) => (
                <LeaderboardRow
                  key={entry.user_id}
                  entry={entry}
                  isCurrentUser={user?.email === entry.email}
                  showRank={false}
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
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  showRank: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 transition-colors ${
        entry.rank <= 3 ? "bg-yellow-50/50" : ""
      } ${isCurrentUser ? "bg-blue-50" : ""} ${!showRank ? "opacity-70" : ""}`}
    >
      <div className="w-8 flex justify-center">
        {showRank ? getRankIcon(entry.rank) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>
      <Avatar className="h-10 w-10">
        <AvatarFallback className="text-sm">
          {entry.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{entry.name}</p>
          {isCurrentUser && <Badge variant="outline" className="text-xs">You</Badge>}
          {!showRank && !entry.qualified && (
            <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
              Unranked
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {entry.quizzesTaken} MCQs
          </span>
          <span className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            {entry.accuracy}% accuracy
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            Score: {entry.score}
          </span>
          {!entry.qualified && (
            <Badge variant="secondary" className="ml-auto text-xs">
              Need {entry.quizzesNeeded} more
            </Badge>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg">{entry.totalCorrect}</p>
        <p className="text-xs text-muted-foreground">correct</p>
        <p className="text-xs text-muted-foreground">/ {entry.totalAttempted} total</p>
      </div>
    </div>
  );
}