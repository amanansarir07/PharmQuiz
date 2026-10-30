"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, LockKeyhole, MessageCircle, ThumbsUp } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCommunityRoom } from "@/lib/community-room";
import { getSupabase } from "@/lib/supabase/client";
import { communityError, loadCommunityMembers, type CommunityMember, type CommunityPost, type CommunityReply } from "@/lib/community";
import { MemberIdentity, communitySubjectLabel } from "@/components/community/community-parts";
import { AppError, AppLoading } from "@/components/app-state";
import { LearningPage } from "@/components/learning-ui";
import { toast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type ReportTarget = { kind: "post" | "reply"; id: string };

export default function DiscussionPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const room = useCommunityRoom();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [members, setMembers] = useState<Record<string, CommunityMember>>({});
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set());
  const [questionText, setQuestionText] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [reportReason, setReportReason] = useState("incorrect");
  const [reportDetail, setReportDetail] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (room.state !== "ready") return;
    setLoading(true); setError("");
    try {
      const client = getSupabase();
      const { data: postData, error: postError } = await client.from("community_posts").select("*").eq("id", id).maybeSingle();
      if (postError) throw postError;
      if (!postData || (postData.room_slug !== room.roomSlug && !isAdmin)) { setPost(null); setReplies([]); return; }
      const currentPost = postData as CommunityPost;
      const { data: replyData, error: repliesError } = await client.from("community_replies").select("*")
        .eq("post_id", id).eq("status", "active").order("created_at", { ascending: true });
      if (repliesError) throw repliesError;
      const currentReplies = (replyData ?? []) as CommunityReply[];
      setPost(currentPost); setReplies(currentReplies);
      setMembers(await loadCommunityMembers([currentPost.author_id, ...currentReplies.map((reply) => reply.author_id)]));
      if (currentPost.question_id) {
        const { data } = await client.from("published_questions").select("question_text").eq("id", currentPost.question_id).maybeSingle();
        setQuestionText(data?.question_text ?? "");
      }
      if (user) {
        const { data: voteData } = await client.from("community_votes").select("post_id,reply_id")
          .eq("voter_id", user.id).or(`post_id.eq.${id},reply_id.in.(${currentReplies.map((reply) => reply.id).join(",") || "00000000-0000-0000-0000-000000000000"})`);
        setMyVotes(new Set((voteData ?? []).map((vote) => vote.post_id || vote.reply_id).filter(Boolean)));
      }
    } catch (cause) { setError(communityError(cause)); }
    finally { setLoading(false); }
  }, [id, user, room.state, room.roomSlug, isAdmin]);
  useEffect(() => { const frame = requestAnimationFrame(() => { void load(); }); return () => cancelAnimationFrame(frame); }, [load]);

  async function act(operation: () => Promise<{ error: { message?: string; code?: string } | null }>, success: string): Promise<boolean> {
    setPending(true);
    try {
      const result = await operation();
      if (result.error) throw result.error;
      toast(success, "success");
      await load();
      return true;
    } catch (cause) { toast(communityError(cause), "error"); return false; }
    finally { setPending(false); }
  }

  async function vote(kind: "post" | "reply", targetId: string) {
    if (!user) { toast("Sign in to mark helpful", "info"); return; }
    const field = kind === "post" ? "post_id" : "reply_id";
    await act(async () => {
      const result = myVotes.has(targetId)
        ? await getSupabase().from("community_votes").delete().eq("voter_id", user.id).eq(field, targetId)
        : await getSupabase().from("community_votes").insert({ voter_id: user.id, [field]: targetId });
      return { error: result.error };
    }, myVotes.has(targetId) ? "Helpful vote removed" : "Marked helpful");
  }

  function startEdit(kind: "post" | "reply", targetId: string, body: string) {
    setEditing(`${kind}:${targetId}`); setEditBody(body);
  }
  async function saveEdit(kind: "post" | "reply", targetId: string) {
    if (!editBody.trim()) return;
    const saved = await act(async () => {
      const result = kind === "post"
        ? await getSupabase().from("community_posts").update({ title: editBody.trim().slice(0, 180), body: editBody.trim() }).eq("id", targetId).select("id").single()
        : await getSupabase().from("community_replies").update({ body: editBody.trim() }).eq("id", targetId).select("id").single();
      return { error: result.error };
    }, "Changes saved");
    if (saved) setEditing(null);
  }
  async function submitReply(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !replyBody.trim() || room.state !== "ready") return;
    const saved = await act(async () => {
      const result = await getSupabase().from("community_replies").insert({ post_id: id, author_id: user.id, body: replyBody.trim() });
      return { error: result.error };
    }, "Reply posted");
    if (saved) setReplyBody("");
  }
  async function report(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !reportTarget) return;
    const target = reportTarget;
    const saved = await act(async () => {
      const result = await getSupabase().from("community_reports").insert({ reporter_id: user.id,
        post_id: target.kind === "post" ? target.id : null,
        reply_id: target.kind === "reply" ? target.id : null,
        reason: reportReason, detail: reportDetail.trim() });
      return { error: result.error };
    }, "Report submitted");
    if (saved) { setReportTarget(null); setReportDetail(""); }
  }

  if (room.state === "loading") return <AppLoading label="Opening your group chat" variant="questions" />;
  if (room.state !== "ready") return <AppError title="Join your group chat" description="Sign in and select your programme to view this message." />;
  if (loading && !post) return <AppLoading label="Loading message" variant="questions" />;
  if (error) return <AppError title="Could not load message" description={error} onRetry={() => void load()} />;
  if (!post) return <AppError title="Message unavailable" description="This message may belong to another programme or may have been removed." />;
  const active = post.status === "active";
  const sortedReplies = [...replies].sort((a, b) => Number(b.id === post.accepted_reply_id) - Number(a.id === post.accepted_reply_id));
  return <LearningPage className="max-w-[820px]">
    <Link href="/community" className="text-sm font-semibold text-primary">Back to group chat</Link>
    {post.status !== "active" && <p className="mt-5 rounded-lg border bg-card p-3 text-sm text-muted-foreground">This message is {post.status}.</p>}
    <article className="mt-5 border-b pb-6">
      <MemberIdentity id={post.author_id} member={members[post.author_id]} date={post.created_at} />
      {editing === `post:${post.id}` ? <div className="mt-4 space-y-3"><label className="block text-sm font-semibold">Message<textarea value={editBody} onChange={(event) => setEditBody(event.target.value)} rows={5} maxLength={10000} className="mt-1 w-full rounded-lg border bg-card p-3" /></label><button type="button" disabled={pending || !editBody.trim()} onClick={() => void saveEdit("post", post.id)} className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Save changes</button><button type="button" onClick={() => setEditing(null)} className="ml-3 text-sm">Cancel</button></div> : <p className="mt-4 whitespace-pre-wrap break-words text-[15px] leading-7">{post.body}</p>}
      {questionText && <div className="mt-5 border-l-2 border-primary bg-primary/5 px-4 py-3"><p className="text-xs font-semibold text-primary">Linked published MCQ</p><p className="mt-1 text-sm">{questionText}</p></div>}
      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {post.subject_slug && <span className="rounded-full bg-secondary px-2.5 py-1 text-foreground">{communitySubjectLabel(post.subject_slug)}</span>}
        <button type="button" disabled={pending || !active || post.author_id === user?.id} onClick={() => void vote("post", post.id)} className="inline-flex min-h-10 items-center gap-1.5 disabled:opacity-50"><ThumbsUp className="size-4" />{post.helpful_count} helpful{myVotes.has(post.id) ? " · You voted" : ""}</button>
        <span className="inline-flex items-center gap-1.5"><MessageCircle className="size-4" />{post.reply_count} replies</span>
        {post.is_locked && <span className="inline-flex items-center gap-1.5"><LockKeyhole className="size-4" />Locked</span>}
        {user && post.author_id !== user.id && active && <button type="button" onClick={() => setReportTarget({ kind: "post", id: post.id })}>Report</button>}
        {post.author_id === user?.id && active && !post.is_locked && <><button type="button" onClick={() => startEdit("post", post.id, post.body)}>Edit</button><button type="button" disabled={pending} onClick={() => { if (window.confirm("Remove this message?")) void act(async () => { const result = await getSupabase().rpc("community_remove", { p_kind: "post", p_id: post.id }); return { error: result.error }; }, "Message removed"); }}>Remove</button></>}
        {isAdmin && <><button type="button" disabled={pending} onClick={() => void act(async () => { const result = await getSupabase().rpc("community_moderate", { p_kind: "post", p_id: post.id, p_action: post.is_locked ? "unlock" : "lock" }); return { error: result.error }; }, post.is_locked ? "Discussion unlocked" : "Discussion locked")}>{post.is_locked ? "Unlock" : "Lock"}</button><button type="button" disabled={pending} onClick={() => void act(async () => { const result = await getSupabase().rpc("community_moderate", { p_kind: "post", p_id: post.id, p_action: active ? "hide" : "restore" }); return { error: result.error }; }, active ? "Discussion hidden" : "Discussion restored")}>{active ? "Hide" : "Restore"}</button></>}
      </div>
    </article>
    <section className="mt-7"><h2 className="text-lg font-bold">Replies <span className="text-sm font-normal text-muted-foreground">{post.reply_count}</span></h2>
      {sortedReplies.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">No replies yet. Add a helpful explanation or a question for clarification.</p> : <div className="mt-3 divide-y">{sortedReplies.map((reply) => <article key={reply.id} className="py-5">
        <div className="flex flex-wrap items-center gap-2"><MemberIdentity id={reply.author_id} member={members[reply.author_id]} date={reply.created_at} />{reply.id === post.accepted_reply_id && <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="size-4" />Accepted answer</span>}</div>
        {editing === `reply:${reply.id}` ? <div className="mt-3"><textarea value={editBody} onChange={(event) => setEditBody(event.target.value)} maxLength={5000} rows={5} className="w-full rounded-lg border bg-card p-3 text-sm" /><div className="mt-2 flex gap-3"><button type="button" disabled={pending} onClick={() => void saveEdit("reply", reply.id)} className="min-h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Save reply</button><button type="button" onClick={() => setEditing(null)} className="text-sm">Cancel</button></div></div> : <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7">{reply.body}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><button type="button" disabled={pending || reply.author_id === user?.id} onClick={() => void vote("reply", reply.id)} className="inline-flex min-h-10 items-center gap-1.5 disabled:opacity-50"><ThumbsUp className="size-4" />{reply.helpful_count} helpful{myVotes.has(reply.id) ? " · You voted" : ""}</button>
          {(post.author_id === user?.id || isAdmin) && active && !post.is_locked && reply.id !== post.accepted_reply_id && <button type="button" disabled={pending} onClick={() => void act(async () => { const result = await getSupabase().rpc("community_accept_reply", { p_post_id: post.id, p_reply_id: reply.id }); return { error: result.error }; }, "Answer accepted")}>Accept answer</button>}
          {reply.author_id === user?.id && active && !post.is_locked && <><button type="button" onClick={() => startEdit("reply", reply.id, reply.body)}>Edit</button>{reply.id !== post.accepted_reply_id && <button type="button" disabled={pending} onClick={() => { if (window.confirm("Remove this reply?")) void act(async () => { const result = await getSupabase().rpc("community_remove", { p_kind: "reply", p_id: reply.id }); return { error: result.error }; }, "Reply removed"); }}>Remove</button>}</>}
          {user && reply.author_id !== user.id && <button type="button" onClick={() => setReportTarget({ kind: "reply", id: reply.id })}>Report</button>}
          {isAdmin && <button type="button" disabled={pending} onClick={() => void act(async () => { const result = await getSupabase().rpc("community_moderate", { p_kind: "reply", p_id: reply.id, p_action: "hide" }); return { error: result.error }; }, "Reply hidden")}>Hide</button>}
        </div>
      </article>)}</div>}
    </section>
    {active && !post.is_locked && <section className="mt-7 border-t pt-6"><h2 className="text-base font-bold">Reply to this message</h2>{user ? <form onSubmit={(event) => void submitReply(event)} className="mt-3"><label htmlFor="community-reply" className="sr-only">Your reply</label><textarea id="community-reply" value={replyBody} onChange={(event) => setReplyBody(event.target.value)} minLength={1} maxLength={5000} required rows={4} placeholder="Write a reply to your group…" className="w-full rounded-lg border bg-card p-3 text-sm leading-6" /><button type="submit" disabled={pending || !replyBody.trim()} className="mt-3 min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{pending ? "Posting…" : "Post reply"}</button></form> : <p className="mt-3 text-sm text-muted-foreground"><Link href="/auth/login" className="font-semibold text-primary">Log in</Link> to reply.</p>}</section>}
    <Dialog open={!!reportTarget} onOpenChange={(open) => { if (!open) setReportTarget(null); }}>
      <DialogContent>
        <DialogTitle>Report {reportTarget?.kind}</DialogTitle>
        <DialogDescription>Reports are reviewed by Bujh administrators.</DialogDescription>
        <form onSubmit={(event) => void report(event)} className="space-y-4">
          <label className="block text-sm font-semibold">Reason
            <select value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="mt-2 h-11 w-full rounded-lg border bg-card px-3">
              <option value="incorrect">Academically incorrect</option><option value="spam">Spam</option>
              <option value="harassment">Harassment</option><option value="other">Other</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">Details (optional)
            <textarea value={reportDetail} onChange={(event) => setReportDetail(event.target.value)} maxLength={1000} rows={3} className="mt-2 w-full rounded-lg border bg-card p-3" />
          </label>
          <div className="flex gap-3"><button type="submit" disabled={pending} className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Submit report</button><button type="button" onClick={() => setReportTarget(null)} className="min-h-11 px-3 text-sm">Cancel</button></div>
        </form>
      </DialogContent>
    </Dialog>
  </LearningPage>;
}
