"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, MessageCircle, ThumbsUp } from "lucide-react";
import type { CommunityMember, CommunityPost } from "@/lib/community";
import { getSubjectName } from "@/data/registry";

export function communitySubjectLabel(slug: string): string {
  const name = getSubjectName(slug);
  return name === slug ? slug.replaceAll("-", " ") : name;
}

export function MemberIdentity({ id, member, date }: { id: string; member?: CommunityMember; date?: string }) {
  return <span className="inline-flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
    <Link href={`/community/members/${id}`} className="font-semibold text-foreground hover:text-primary">{member?.display_name || "Community member"}</Link>
    {member?.is_admin && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Admin</span>}
    {member?.is_teacher && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground">Verified Teacher</span>}
    {date && <time dateTime={date}>· {formatDistanceToNow(new Date(date), { addSuffix: true })}</time>}
  </span>;
}

export function PostRow({ post, member }: { post: CommunityPost; member?: CommunityMember }) {
  return <article className="border-b py-5 last:border-b-0">
    <div className="mb-2"><MemberIdentity id={post.author_id} member={member} date={post.created_at} /></div>
    <Link href={`/community/${post.id}`} className="block text-[15px] font-bold leading-6 hover:text-primary sm:text-base">{post.title}</Link>
    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{post.body}</p>
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      {post.subject_slug && <span className="rounded-full bg-secondary px-2.5 py-1 text-foreground">{communitySubjectLabel(post.subject_slug)}</span>}
      {post.faculty_slug && <span>{post.faculty_slug === "plus-two" ? "+2" : post.faculty_slug.toUpperCase()}</span>}
      <span className="inline-flex items-center gap-1"><ThumbsUp className="size-3.5" />{post.helpful_count} helpful</span>
      <span className="inline-flex items-center gap-1"><MessageCircle className="size-3.5" />{post.reply_count} replies</span>
      {post.accepted_reply_id && <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="size-3.5" />Answered</span>}
    </div>
  </article>;
}
