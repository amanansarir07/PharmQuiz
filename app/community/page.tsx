"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Bell, MessageCircleQuestion, Plus, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { getSubjectsForProgram } from "@/data/registry";
import { getSupabase } from "@/lib/supabase/client";
import { communityError, loadCommunityMembers, type CommunityMember, type CommunityPost } from "@/lib/community";
import { PostRow } from "@/components/community/community-parts";
import { AppEmpty, AppError, AppLoading } from "@/components/app-state";
import { LearningPage } from "@/components/learning-ui";

type Sort = "recent" | "popular" | "unanswered";
const PAGE_SIZE = 20;

function CommunityFeed() {
  const params = useSearchParams();
  const questionId = params.get("question");
  const { user, isAdmin } = useAuth();
  const { programSlug } = useActiveProgram();
  const subjects = useMemo(() => getSubjectsForProgram(programSlug), [programSlug]);
  const [sort, setSort] = useState<Sort>("recent");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState("");
  const [subject, setSubject] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<Record<string, CommunityMember>>({});
  const [total, setTotal] = useState(0);
  const [questionText, setQuestionText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let query = getSupabase().from("community_posts")
        .select("*", { count: "exact" }).eq("status", "active");
      if (questionId) query = query.eq("question_id", questionId);
      if (faculty) query = query.eq("faculty_slug", faculty);
      if (subject) query = query.eq("subject_slug", subject);
      if (sort === "unanswered") query = query.is("accepted_reply_id", null);
      if (search.trim()) query = query.textSearch("search_document", search.trim(), { type: "websearch", config: "english" });
      query = sort === "popular"
        ? query.order("helpful_count", { ascending: false }).order("created_at", { ascending: false })
        : query.order(sort === "recent" ? "last_activity_at" : "created_at", { ascending: false });
      const { data, count, error: readError } = await query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (readError) throw readError;
      const rows = (data ?? []) as CommunityPost[];
      setPosts(rows);
      setTotal(count ?? 0);
      setMembers(await loadCommunityMembers(rows.map((post) => post.author_id)));
    } catch (cause) { setError(communityError(cause)); }
    finally { setLoading(false); }
  }, [questionId, faculty, subject, sort, search, page]);

  useEffect(() => { const frame = requestAnimationFrame(() => { void load(); }); return () => cancelAnimationFrame(frame); }, [load]);
  useEffect(() => {
    if (!questionId) return;
    let cancelled = false;
    void getSupabase().from("published_questions").select("question_text").eq("id", questionId).maybeSingle()
      .then(({ data }) => { if (!cancelled) setQuestionText(data?.question_text ?? ""); });
    return () => { cancelled = true; };
  }, [questionId]);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void getSupabase().from("community_notifications").select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id).is("read_at", null)
      .then(({ count }) => { if (!cancelled) setUnread(count ?? 0); });
    return () => { cancelled = true; };
  }, [user]);

  const askHref = `/community/new${questionId ? `?question=${encodeURIComponent(questionId)}` : ""}`;
  return <LearningPage className="max-w-[940px]">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold text-primary">Learn together</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Community</h1><p className="mt-1 text-sm text-muted-foreground">Ask clearly. Share what helped. Make the next answer easier to find.</p></div>
      <div className="flex items-center gap-2">
        {user && <Link href="/community/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative inline-flex size-11 items-center justify-center rounded-lg border bg-card"><Bell className="size-5" />{unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{unread > 9 ? "9+" : unread}</span>}</Link>}
        <Link href={user ? askHref : "/auth/login"} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"><Plus className="size-4" />Ask a question</Link>
      </div>
    </div>
    {questionId && <div className="mt-6 border-l-2 border-primary bg-primary/5 px-4 py-3"><p className="text-xs font-semibold text-primary">Discussing an MCQ</p><p className="mt-1 text-sm font-medium">{questionText || "This published question"}</p><Link href="/community" className="mt-2 inline-block text-xs font-semibold text-primary">View all discussions</Link></div>}
    <div className="mt-7 border-b">
      <nav aria-label="Discussion views" className="flex gap-6">{(["recent", "popular", "unanswered"] as const).map((option) => <button key={option} type="button" onClick={() => { setSort(option); setPage(0); }} aria-current={sort === option ? "page" : undefined} className={`min-h-11 border-b-2 text-sm font-semibold capitalize ${sort === option ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{option}</button>)}</nav>
    </div>
    <form onSubmit={(event) => { event.preventDefault(); setSearch(searchInput); setPage(0); }} className="mt-5 flex flex-wrap gap-2 sm:gap-3">
      <label className="relative min-w-[160px] flex-1"><span className="sr-only">Search discussions</span><Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search discussions" className="h-11 w-full rounded-lg border bg-card pl-10 pr-3 text-sm" /></label>
      <button type="submit" className="min-h-11 rounded-lg border bg-card px-4 text-sm font-semibold">Search</button>
      <button type="button" aria-expanded={showFilters} onClick={() => setShowFilters((value) => !value)} className="min-h-11 rounded-lg border bg-card px-4 text-sm font-semibold sm:hidden">Filters{faculty || subject ? " · Active" : ""}</button>
      <select aria-label="Filter by stream" value={faculty} onChange={(event) => { setFaculty(event.target.value); setPage(0); }} className={`${showFilters ? "block" : "hidden"} h-11 w-full rounded-lg border bg-card px-3 text-sm sm:block sm:w-auto`}><option value="">All streams</option><option value="ctevt">CTEVT</option><option value="plus-two">+2</option><option value="npc">Pharmacy Council</option></select>
      <select aria-label="Filter by subject" value={subject} onChange={(event) => { setSubject(event.target.value); setPage(0); }} className={`${showFilters ? "block" : "hidden"} h-11 w-full max-w-full rounded-lg border bg-card px-3 text-sm sm:block sm:w-auto`}><option value="">All subjects</option>{subjects.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select>
    </form>
    <div className="mt-6">
      <div className="flex items-center justify-between"><h2 className="text-base font-bold">Discussions</h2><span className="text-xs text-muted-foreground">{total} found</span></div>
      {loading ? <AppLoading label="Loading discussions" variant="questions" /> : error ? <AppError title="Could not load Community" description={error} onRetry={() => void load()} /> : posts.length ? <div className="mt-2">{posts.map((post) => <PostRow key={post.id} post={post} member={members[post.author_id]} />)}</div> : <AppEmpty title="No discussions yet" description={questionId ? "Start a discussion about this question." : "Try another search or start the first discussion."} action="Ask a question" onAction={() => { window.location.href = user ? askHref : "/auth/login"; }} />}
      {!loading && !error && total > PAGE_SIZE && <div className="mt-5 flex justify-center gap-2"><button type="button" disabled={page === 0} onClick={() => setPage((value) => value - 1)} className="min-h-11 rounded-lg border px-4 text-sm disabled:opacity-40">Previous</button><button type="button" disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage((value) => value + 1)} className="min-h-11 rounded-lg border px-4 text-sm disabled:opacity-40">Next</button></div>}
    </div>
    <div className="mt-8 flex flex-wrap gap-4 border-t pt-5 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><MessageCircleQuestion className="size-4" />Keep questions focused on learning and evidence.</span>{isAdmin && <Link href="/community/moderation" className="font-semibold text-primary">Moderation queue</Link>}</div>
  </LearningPage>;
}

export default function CommunityPage() {
  return <Suspense fallback={<AppLoading label="Opening Community" variant="questions" />}><CommunityFeed /></Suspense>;
}
