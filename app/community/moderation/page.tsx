"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase/client";
import { communityError } from "@/lib/community";
import { toast } from "@/components/ui/toast";
import { AppError, AppLoading } from "@/components/app-state";
import { LearningPage } from "@/components/learning-ui";

type Report = { id: string; reporter_id: string; post_id: string | null; reply_id: string | null;
  reply_post_id?: string; reason: string; detail: string; state: string; created_at: string };

export default function CommunityModerationPage() {
  const { user, isAdmin } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teachers, setTeachers] = useState<{ user_id: string; verified_at: string }[]>([]);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const load = useCallback(async () => {
    if (!isAdmin) { setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const client = getSupabase();
      const [reportResult, teacherResult] = await Promise.all([
        client.from("community_reports").select("*").eq("state", "open").order("created_at", { ascending: false }).limit(100),
        client.from("community_teacher_verifications").select("user_id,verified_at").order("verified_at", { ascending: false }).limit(100),
      ]);
      if (reportResult.error) throw reportResult.error;
      if (teacherResult.error) throw teacherResult.error;
      const openReports = (reportResult.data ?? []) as Report[];
      const replyIds = openReports.flatMap((report) => report.reply_id ? [report.reply_id] : []);
      let replyPosts: Record<string, string> = {};
      if (replyIds.length) {
        const { data: replyData, error: replyError } = await client.from("community_replies")
          .select("id,post_id").in("id", replyIds);
        if (replyError) throw replyError;
        replyPosts = Object.fromEntries((replyData ?? []).map((reply) => [reply.id, reply.post_id]));
      }
      setReports(openReports.map((report) => ({ ...report, reply_post_id: report.reply_id ? replyPosts[report.reply_id] : undefined })));
      setTeachers(teacherResult.data ?? []);
    } catch (cause) { setError(communityError(cause)); }
    finally { setLoading(false); }
  }, [isAdmin]);
  useEffect(() => { const frame = requestAnimationFrame(() => { void load(); }); return () => cancelAnimationFrame(frame); }, [load]);

  async function review(report: Report, action: "hide" | "dismiss") {
    if (!user) return;
    setPending(true);
    try {
      const { error: reviewError } = await getSupabase().rpc("community_review_report", {
        p_report_id: report.id, p_action: action,
      });
      if (reviewError) throw reviewError;
      toast(action === "hide" ? "Content hidden and report resolved" : "Report dismissed", "success");
      await load();
    } catch (cause) { toast(communityError(cause), "error"); }
    finally { setPending(false); }
  }
  async function verifyTeacher(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setFormError("");
    setPending(true);
    try {
      const { data, error: lookupError } = await getSupabase().from("profiles")
        .select("id").eq("email", teacherEmail.trim().toLowerCase()).maybeSingle();
      if (lookupError) throw lookupError;
      if (!data) { setFormError("No account matches that email address."); return; }
      const { error: insertError } = await getSupabase().from("community_teacher_verifications")
        .insert({ user_id: data.id, verified_by: user.id });
      if (insertError) throw insertError;
      toast("Teacher verified", "success"); setTeacherEmail(""); await load();
    } catch (cause) { setFormError(communityError(cause)); }
    finally { setPending(false); }
  }
  if (loading) return <AppLoading label="Loading moderation queue" variant="questions" />;
  if (!isAdmin) return <AppError title="Administrator access required" description="Community moderation is available to verified Bujh administrators." />;
  if (error && !reports.length) return <AppError title="Could not load moderation" description={error} onRetry={() => void load()} />;
  return <LearningPage className="max-w-[900px]"><Link href="/community" className="text-sm font-semibold text-primary">Back to Community</Link><h1 className="mt-5 text-2xl font-bold">Community moderation</h1><p className="mt-1 text-sm text-muted-foreground">Review reports before hiding content. Teacher verification is controlled by administrators.</p>
    <section className="mt-8"><h2 className="text-base font-bold">Open reports ({reports.length})</h2>{reports.length ? <div className="mt-3 divide-y border-y">{reports.map((report) => <article key={report.id} className="py-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold capitalize">{report.reason}</p><time className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</time></div>{report.detail && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{report.detail}</p>}<div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold"><Link href={report.post_id || report.reply_post_id ? `/community/${report.post_id || report.reply_post_id}` : "/community"} className="text-primary">View discussion</Link><button type="button" disabled={pending} onClick={() => void review(report, "hide")} className="min-h-10 text-destructive">Hide content</button><button type="button" disabled={pending} onClick={() => void review(report, "dismiss")} className="min-h-10">Dismiss report</button></div></article>)}</div> : <p className="mt-3 text-sm text-muted-foreground">No reports need review.</p>}</section>
    <section className="mt-9 border-t pt-7"><h2 className="text-base font-bold">Verified Teachers</h2><p className="mt-1 text-sm text-muted-foreground">Only verify educators whose identity you have checked outside the app.</p><form onSubmit={(event) => void verifyTeacher(event)} className="mt-4 flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="teacher-email">Teacher account email</label><input id="teacher-email" type="email" required value={teacherEmail} onChange={(event) => setTeacherEmail(event.target.value)} placeholder="Teacher account email" className="h-11 flex-1 rounded-lg border bg-card px-3 text-sm" /><button type="submit" disabled={pending} className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Verify Teacher</button></form>{formError && <p role="alert" className="mt-2 text-sm text-destructive">{formError}</p>}<p className="mt-3 text-xs text-muted-foreground">{teachers.length} verified teacher account{teachers.length === 1 ? "" : "s"}</p>{teachers.length > 0 && <ul className="mt-2 divide-y border-y">{teachers.map((teacher) => <li key={teacher.user_id} className="flex items-center justify-between gap-2 py-2 text-xs"><Link href={`/community/members/${teacher.user_id}`} className="font-semibold text-primary">{teacher.user_id}</Link><button type="button" disabled={pending} onClick={() => { if (window.confirm("Remove this Teacher verification?")) void (async () => { setPending(true); const { error: removeError } = await getSupabase().from("community_teacher_verifications").delete().eq("user_id", teacher.user_id); if (removeError) toast(communityError(removeError), "error"); else { toast("Teacher verification removed", "success"); await load(); } setPending(false); })(); }} className="min-h-10 text-destructive">Remove badge</button></li>)}</ul>}</section>
  </LearningPage>;
}
