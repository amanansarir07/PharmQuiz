"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCommunityRoom } from "@/lib/community-room";
import { getSupabase } from "@/lib/supabase/client";
import { communityError, type CommunityMember, type CommunityPost } from "@/lib/community";
import { PostRow } from "@/components/community/community-parts";
import { AppError, AppLoading } from "@/components/app-state";
import { LearningPage } from "@/components/learning-ui";

export default function CommunityMemberPage() {
  const { id } = useParams<{ id: string }>();
  const room = useCommunityRoom();
  const [member, setMember] = useState<CommunityMember | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (room.state !== "ready" || !room.roomSlug) return;
    setLoading(true); setError("");
    try {
      const client = getSupabase();
      const { data: memberData, error: memberError } = await client.from("community_members")
        .select("*").eq("user_id", id).maybeSingle();
      if (memberError) throw memberError;
      setMember(memberData as CommunityMember | null);
      if (memberData) {
        const { data, error: postsError } = await client.from("community_posts").select("*")
          .eq("author_id", id).eq("room_slug", room.roomSlug).eq("status", "active").order("created_at", { ascending: false }).limit(30);
        if (postsError) throw postsError;
        setPosts((data ?? []) as CommunityPost[]);
      }
    } catch (cause) { setError(communityError(cause)); }
    finally { setLoading(false); }
  }, [id, room.state, room.roomSlug]);
  useEffect(() => { const frame = requestAnimationFrame(() => { void load(); }); return () => cancelAnimationFrame(frame); }, [load]);
  if (room.state === "loading" || loading && room.state === "ready") return <AppLoading label="Loading member profile" />;
  if (room.state !== "ready") return <AppError title="Join your group chat" description="Sign in and select your programme to view member profiles." />;
  if (error) return <AppError title="Could not load profile" description={error} onRetry={() => void load()} />;
  if (!member) return <AppError title="Member unavailable" description="This member has not joined the Community." />;
  return <LearningPage className="max-w-[820px]"><Link href="/community" className="text-sm font-semibold text-primary">Back to group chat</Link><div className="mt-5 border-b pb-6"><div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">{member.display_name.slice(0, 2).toUpperCase()}</span><div><h1 className="text-xl font-bold">{member.display_name}</h1><div className="mt-1 flex gap-2 text-xs">{member.is_admin && <span className="rounded-full bg-primary/10 px-2 py-1 font-bold text-primary">Admin</span>}{member.is_teacher && <span className="rounded-full bg-secondary px-2 py-1 font-bold">Verified Teacher</span>}</div></div></div></div><h2 className="mt-7 text-base font-bold">Messages in {room.roomLabel}</h2>{posts.length ? <div className="mt-2 divide-y">{posts.map((post) => <PostRow key={post.id} post={post} member={member} />)}</div> : <p className="mt-5 text-sm text-muted-foreground">No messages in this group yet.</p>}</LearningPage>;
}
