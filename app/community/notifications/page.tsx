"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase/client";
import { communityError, loadCommunityMembers, type CommunityMember } from "@/lib/community";
import { AppError, AppLoading } from "@/components/app-state";
import { LearningPage } from "@/components/learning-ui";

type Notice = { id: string; actor_id: string | null; post_id: string | null;
  kind: "reply" | "accepted"; created_at: string; read_at: string | null };

export default function CommunityNotificationsPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [members, setMembers] = useState<Record<string, CommunityMember>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const { data, error: readError } = await getSupabase().from("community_notifications")
        .select("id,actor_id,post_id,kind,created_at,read_at").eq("recipient_id", user.id)
        .order("created_at", { ascending: false }).limit(50);
      if (readError) throw readError;
      const rows = (data ?? []) as Notice[];
      setNotices(rows);
      setMembers(await loadCommunityMembers(rows.flatMap((item) => item.actor_id ? [item.actor_id] : [])));
    } catch (cause) { setError(communityError(cause)); }
    finally { setLoading(false); }
  }, [user]);
  useEffect(() => { const frame = requestAnimationFrame(() => { void load(); }); return () => cancelAnimationFrame(frame); }, [load]);
  if (loading) return <AppLoading label="Loading Community notifications" />;
  if (!user) return <AppError title="Sign in to see notifications" description="Community replies and accepted answers appear here for your account." />;
  if (error) return <AppError title="Could not load notifications" description={error} onRetry={() => void load()} />;
  return <LearningPage className="max-w-[760px]"><Link href="/community" className="text-sm font-semibold text-primary">Back to Community</Link><div className="mt-5 flex items-center justify-between"><h1 className="text-2xl font-bold">Notifications</h1>{notices.some((item) => !item.read_at) && <button type="button" onClick={async () => { const { error: updateError } = await getSupabase().from("community_notifications").update({ read_at: new Date().toISOString() }).eq("recipient_id", user.id).is("read_at", null); if (updateError) setError(communityError(updateError)); else void load(); }} className="min-h-11 text-sm font-semibold text-primary">Mark all read</button>}</div>{notices.length ? <div className="mt-5 divide-y border-y">{notices.map((notice) => <Link key={notice.id} href={notice.post_id ? `/community/${notice.post_id}` : "/community"} className={`block py-4 text-sm ${notice.read_at ? "text-muted-foreground" : "font-semibold"}`}><span>{members[notice.actor_id ?? ""]?.display_name || "A member"} {notice.kind === "reply" ? "replied to your discussion" : "accepted your answer"}.</span><time dateTime={notice.created_at} className="mt-1 block text-xs text-muted-foreground">{formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}</time></Link>)}</div> : <p className="mt-8 text-sm text-muted-foreground">No notifications yet. Replies and accepted answers will appear here.</p>}</LearningPage>;
}
