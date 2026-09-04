"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import {
  createMockExam,
  deleteMockExam,
  fetchAllExams,
  formatInKathmandu,
  isExamLive,
  isExamOver,
  kathmanduWallToUtc,
  updateMockExam,
  utcToKathmanduWall,
  type MockExam,
} from "@/lib/mock-exams";
import {
  ArrowLeft,
  CalendarClock,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
} from "lucide-react";

function timeToLabel(targetIso: string, now: Date): string | null {
  const diff = new Date(targetIso).getTime() - now.getTime();
  if (diff <= 0) return null;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + " min";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h " + (mins % 60) + "m";
  return Math.floor(hrs / 24) + "d " + (hrs % 24) + "h";
}

export default function AdminMockExamsPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();
  const [exams, setExams] = useState<MockExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [duration, setDuration] = useState("80");
  const [now, setNow] = useState(() => new Date());
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchAllExams()
      .then(setExams)
      .catch((e) => setError("Could not load exams: " + e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isAdmin) load();
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, [isAdmin, load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const dur = Math.round(Number(duration));
    if (!title.trim()) return setError("Give the exam a title.");
    if (!startsAt) return setError("Pick a date and time (Kathmandu time).");
    if (!Number.isFinite(dur) || dur < 5 || dur > 180)
      return setError("Duration must be between 5 and 180 minutes.");
    if (kathmanduWallToUtc(startsAt).getTime() <= Date.now())
      return setError("Start time must be in the future.");

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        startsAt,
        durationMinutes: dur,
      };
      if (editingId) {
        await updateMockExam(editingId, payload);
      } else {
        await createMockExam(payload);
      }
      setTitle("");
      setStartsAt("");
      setEditingId(null);
      load();
    } catch (err: any) {
      setError(
        err?.message ||
          (editingId
            ? "Could not save the exam."
            : "Could not create the exam. Are you an admin?")
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (exam: MockExam) => {
    setError("");
    setEditingId(exam.id);
    setTitle(exam.title);
    setStartsAt(utcToKathmanduWall(exam.starts_at));
    setDuration(String(exam.duration_minutes));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setStartsAt("");
    setDuration("80");
    setError("");
  };

  const remove = async (exam: MockExam) => {
    if (!window.confirm('Delete "' + exam.title + '"? This cannot be undone.'))
      return;
    setError("");
    try {
      await deleteMockExam(exam.id);
      setExams((prev) => prev.filter((x) => x.id !== exam.id));
    } catch (err: any) {
      setError(err?.message || "Could not delete the exam.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8">
            <ShieldAlert className="h-10 w-10 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Admins only</h1>
            <p className="text-sm text-muted-foreground">
              Scheduling mock exams is restricted to admin accounts.
            </p>
            <Button variant="outline" onClick={() => router.push("/mock-test")}>
              Back to Mock Test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <button
        onClick={() => router.push("/mock-test")}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Mock Test
      </button>

      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Megaphone className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Mock Exams</h1>
          <p className="mt-1 text-muted-foreground">
            Announce an exam at a fixed time. Students can join the moment it
            goes live and the timer starts.
          </p>
        </div>
      </div>

      {/* Create form */}
      <Card className="mb-8">
        <CardContent className="p-5 sm:p-6">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">
              {editingId ? "Edit scheduled exam" : "New scheduled exam"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel editing
              </button>
            )}
          </div>
          {editingId && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              Change the title or time and hit Save — students see the update
              immediately.
            </p>
          )}
          <p className="mb-5 text-sm text-muted-foreground">
            All times are{" "}
            <span className="font-medium text-foreground">
              Kathmandu time (GMT+5:45)
            </span>
            . It is currently{" "}
            <span className="font-medium text-foreground">
              {formatInKathmandu(now.toISOString(), "short")}
            </span>
            .
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="exam-title">Exam title</Label>
              <Input
                id="exam-title"
                placeholder="e.g. Weekly Mock Test #1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="exam-start">Starts at (Kathmandu time)</Label>
                <Input
                  id="exam-start"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exam-duration">Duration (minutes)</Label>
                <Input
                  id="exam-duration"
                  type="number"
                  min={5}
                  max={180}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : editingId ? (
                  <Save className="mr-2 h-4 w-4" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {editingId ? "Save Changes" : "Schedule Exam"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing exams */}
      <h2 className="mb-3 text-base font-semibold">Scheduled &amp; past exams</h2>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No exams scheduled yet. Create your first one above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const live = isExamLive(exam, now);
            const over = isExamOver(exam, now);
            const startsLabel = timeToLabel(exam.starts_at, now);
            return (
              <Card key={exam.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{exam.title}</p>
                      {live ? (
                        <Badge className="bg-green-600 text-white">● LIVE</Badge>
                      ) : over ? (
                        <Badge variant="secondary">Ended</Badge>
                      ) : (
                        <Badge variant="secondary">
                          {startsLabel ? "Starts " + startsLabel : "Starts soon"}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {formatInKathmandu(exam.starts_at)} (Kathmandu)
                      <span aria-hidden>·</span>
                      {exam.duration_minutes} min
                      {!over && (
                        <>
                          <span aria-hidden>·</span>ends{" "}
                          {formatInKathmandu(exam.ends_at, "short")}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(exam)}
                    >
                      <Pencil className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-600"
                      onClick={() => remove(exam)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Students see upcoming exams on the{" "}
        <Link href="/mock-test" className="text-primary hover:underline">
          Mock Test page
        </Link>
        , and join when the exam is live.
      </p>
    </div>
  );
}
