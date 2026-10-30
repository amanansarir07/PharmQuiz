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
  return <article className="py-4">
    <MemberIdentity id={post.author_id} member={member} date={post.created_at} />
    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{post.body}</p>
    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      {post.question_id && <span className="font-semibold text-primary">Linked MCQ</span>}
      <Link href={`/community/${post.id}`} className="inline-flex min-h-8 items-center gap-1 hover:text-primary"><MessageCircle className="size-3.5" />{post.reply_count ? `${post.reply_count} replies` : "Reply"}</Link>
      {post.helpful_count > 0 && <span className="inline-flex items-center gap-1"><ThumbsUp className="size-3.5" />{post.helpful_count} helpful</span>}
      {post.accepted_reply_id && <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="size-3.5" />Answered</span>}
    </div>
  </article>;
}
