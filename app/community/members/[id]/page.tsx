"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { communityError, type CommunityMember, type CommunityPost } from "@/lib/community";
import { PostRow } from "@/components/community/community-parts";
import { AppError, AppLoading } from "@/components/app-state";
import { LearningPage } from "@/components/learning-ui";

export default function CommunityMemberPage() {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<CommunityMember | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const client = getSupabase();
      const { data: memberData, error: memberError } = await client.from("community_members")
        .select("*").eq("user_id", id).maybeSingle();
      if (memberError) throw memberError;
      setMember(memberData as CommunityMember | null);
      if (memberData) {
        const { data, error: postsError } = await client.from("community_posts").select("*")
          .eq("author_id", id).eq("status", "active").order("created_at", { ascending: false }).limit(30);
        if (postsError) throw postsError;
        setPosts((data ?? []) as CommunityPost[]);
      }
    } catch (cause) { setError(communityError(cause)); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { const frame = requestAnimationFrame(() => { void load(); }); return () => cancelAnimationFrame(frame); }, [load]);
  if (loading) return <AppLoading label="Loading member profile" />;
  if (error) return <AppError title="Could not load profile" description={error} onRetry={() => void load()} />;
  if (!member) return <AppError title="Member unavailable" description="This member has not joined the Community." />;
  return <LearningPage className="max-w-[820px]"><Link href="/community" className="text-sm font-semibold text-primary">Back to Community</Link><div className="mt-5 border-b pb-6"><div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">{member.display_name.slice(0, 2).toUpperCase()}</span><div><h1 className="text-xl font-bold">{member.display_name}</h1><div className="mt-1 flex gap-2 text-xs">{member.is_admin && <span className="rounded-full bg-primary/10 px-2 py-1 font-bold text-primary">Admin</span>}{member.is_teacher && <span className="rounded-full bg-secondary px-2 py-1 font-bold">Verified Teacher</span>}</div></div></div><p className="mt-3 text-xs text-muted-foreground">Community discussions are public. Account details and study history are private.</p></div><h2 className="mt-7 text-base font-bold">Discussions</h2>{posts.length ? <div className="mt-2">{posts.map((post) => <PostRow key={post.id} post={post} member={member} />)}</div> : <p className="mt-5 text-sm text-muted-foreground">No public discussions yet.</p>}</LearningPage>;
}
