"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Flame, Target, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/leaderboard";
import { useAuth } from "@/lib/auth";

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
    setEntries(getLeaderboard());
  }, []);

  // Refresh when page becomes visible
  useEffect(() => {
    const handler = () => setEntries(getLeaderboard());
    window.addEventListener("focus", handler);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handler();
    });
    return () => {
      window.removeEventListener("focus", handler);
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          See how you rank among your classmates
        </p>
      </div>

      {!mounted ? (
        <div className="text-center py-20 text-muted-foreground">Loading leaderboard...</div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No users registered yet</p>
            <p className="text-sm text-muted-foreground">
              Register an account and start taking MCQs to appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {entries.length} registered user{entries.length !== 1 ? "s" : ""}
          </p>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {entries.map((entry) => {
                  const isCurrentUser = user?.email === entry.email;
                  return (
                    <div
                      key={entry.email}
                      className={`flex items-center gap-4 px-5 py-4 ${
                        entry.rank <= 3 ? "bg-primary/5" : ""
                      } ${isCurrentUser ? "bg-blue-50" : ""}`}
                    >
                      <div className="w-8 flex justify-center">
                        {getRankIcon(entry.rank)}
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
                          {entry.isAdmin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {entry.quizzesTaken} MCQs
                          </span>
                          <span>{entry.accuracy}% accuracy</span>
                          {entry.currentStreak > 0 && (
                            <span className="flex items-center gap-1 text-orange-500">
                              <Flame className="h-3 w-3" />
                              {entry.currentStreak} day streak
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{entry.totalCorrect}</p>
                        <p className="text-xs text-muted-foreground">
                          correct
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* How scoring works */}
          <Card className="mt-6">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Scoring:</strong> Rankings are based on total correct answers. Ties are
                broken by accuracy percentage. Complete more MCQs to climb the leaderboard!
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
