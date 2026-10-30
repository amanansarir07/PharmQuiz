"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Bell, Search, Send } from "lucide-react";
import { getContentSourceProgramSlug } from "@/data/registry";
import { useCommunityRoom } from "@/lib/community-room";
import { getSupabase } from "@/lib/supabase/client";
import { communityError, loadCommunityMembers, type CommunityMember, type CommunityPost } from "@/lib/community";
import { PostRow } from "@/components/community/community-parts";
import { AppError, AppLoading } from "@/components/app-state";
import { LearningPage } from "@/components/learning-ui";
import { toast } from "@/components/ui/toast";

const PAGE_SIZE = 30;

function CommunityChat() {
  const params = useSearchParams();
  const questionId = params.get("question");
  const room = useCommunityRoom();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<Record<string, CommunityMember>>({});
  const [shownRoom, setShownRoom] = useState("");
  const [hasOlder, setHasOlder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionSubject, setQuestionSubject] = useState("");
  const [questionAllowed, setQuestionAllowed] = useState(false);
  const [unread, setUnread] = useState(0);
  const requestSequence = useRef(0);

  const loadRecent = useCallback(async (showLoading = false) => {
    if (room.state !== "ready" || !room.roomSlug) return;
    const request = ++requestSequence.current;
    if (showLoading) setLoading(true);
    try {
      let query = getSupabase().from("community_posts").select("*")
        .eq("room_slug", room.roomSlug).eq("status", "active")
        .order("created_at", { ascending: false }).order("id", { ascending: false }).limit(PAGE_SIZE);
      if (search) query = query.textSearch("search_document", search, { type: "websearch", config: "english" });
      const { data, error: readError } = await query;
      if (readError) throw readError;
      const rows = (data ?? []) as CommunityPost[];
      const loaded = await loadCommunityMembers(rows.map((post) => post.author_id));
      if (request !== requestSequence.current) return;
      setPosts((previous) => showLoading || search || shownRoom !== room.roomSlug
        ? rows : [...rows, ...previous.filter((item) => !rows.some((fresh) => fresh.id === item.id))]);
      setMembers((previous) => ({ ...previous, ...loaded }));
      setShownRoom(room.roomSlug);
      setHasOlder(rows.length === PAGE_SIZE);
      setError("");
    } catch (cause) { if (request === requestSequence.current) setError(communityError(cause)); }
    finally { if (showLoading) setLoading(false); }
  }, [room.state, room.roomSlug, search, shownRoom]);

  useEffect(() => {
    if (room.state !== "ready") return;
    const frame = requestAnimationFrame(() => { void loadRecent(true); });
    const timer = window.setInterval(() => { if (!search) void loadRecent(); }, 12000);
    return () => { requestSequence.current += 1; cancelAnimationFrame(frame); window.clearInterval(timer); };
  }, [room.state, loadRecent, search]);

  useEffect(() => {
    if (!room.user) return;
    let cancelled = false;
    void getSupabase().from("community_notifications").select("id", { count: "exact", head: true })
      .eq("recipient_id", room.user.id).is("read_at", null)
      .then(({ count }) => { if (!cancelled) setUnread(count ?? 0); });
    return () => { cancelled = true; };
  }, [room.user]);

  useEffect(() => {
    if (!questionId || room.state !== "ready") return;
    let cancelled = false;
    void getSupabase().from("published_questions").select("question_text,subject_slug,program_slug")
      .eq("id", questionId).maybeSingle().then(({ data }) => {
        if (cancelled) return;
        setQuestionText(data?.question_text ?? "");
        setQuestionSubject(data?.subject_slug ?? "");
        setQuestionAllowed(!!data && data.program_slug === getContentSourceProgramSlug(room.program.slug));
      });
    return () => { cancelled = true; };
  }, [questionId, room.state, room.program.slug]);

  async function loadOlder() {
    if (!room.roomSlug || !posts.length) return;
    setLoadingOlder(true);
    try {
      const last = posts[posts.length - 1];
      let query = getSupabase().from("community_posts").select("*")
        .eq("room_slug", room.roomSlug).eq("status", "active")
        .lt("created_at", last.created_at).order("created_at", { ascending: false }).limit(PAGE_SIZE);
      if (search) query = query.textSearch("search_document", search, { type: "websearch", config: "english" });
      const { data, error: readError } = await query;
      if (readError) throw readError;
      const rows = (data ?? []) as CommunityPost[];
      const loaded = await loadCommunityMembers(rows.map((post) => post.author_id));
      setPosts((previous) => [...previous, ...rows]);
      setMembers((previous) => ({ ...previous, ...loaded }));
      setHasOlder(rows.length === PAGE_SIZE);
    } catch (cause) { toast(communityError(cause), "error"); }
    finally { setLoadingOlder(false); }
  }

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !room.user || !room.roomSlug || room.state !== "ready") return;
    if (questionId && !questionAllowed) { toast("This question belongs to another programme", "error"); return; }
    setSending(true);
    const { error: writeError } = await getSupabase().from("community_posts").insert({
      author_id: room.user.id, room_slug: room.roomSlug, body, title: body.slice(0, 180),
      faculty_slug: room.program.facultySlug,
      subject_slug: questionId ? questionSubject : null, question_id: questionId || null,
    });
    setSending(false);
    if (writeError) { toast(communityError(writeError), "error"); return; }
    setDraft("");
    toast("Message sent", "success");
    await loadRecent();
  }

  return <LearningPage className="max-w-[900px]">
    <header className="flex items-start justify-between gap-3 border-b pb-4">
      <div className="min-w-0"><h1 className="text-2xl font-bold tracking-tight">Community</h1>
        <p className="mt-1 text-sm text-muted-foreground">{room.state === "ready" ? room.roomLabel : "Your programme group chat"}</p></div>
      {room.user && <Link href="/community/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-lg border bg-card"><Bell className="size-5" />{unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{unread > 9 ? "9+" : unread}</span>}</Link>}
    </header>
    {room.state === "loading" && <AppLoading label="Opening your group chat" variant="questions" />}
    {room.state === "guest" && <div className="py-12"><h2 className="text-lg font-bold">Join your programme chat</h2><p className="mt-2 text-sm text-muted-foreground">Sign in and choose your programme to read and send messages.</p><Link href="/auth/login" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Log in</Link></div>}
    {room.state === "choose-program" && <div className="py-12"><h2 className="text-lg font-bold">Choose your programme</h2><p className="mt-2 text-sm text-muted-foreground">Your selected programme determines which group chat you can join.</p><Link href="/programs" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Choose programme</Link></div>}
    {room.state === "choose-grade" && <div className="py-12"><h2 className="text-lg font-bold">Choose your grade</h2><p className="mt-2 text-sm text-muted-foreground">Grade 11 and Grade 12 have separate {room.program.name} chats.</p><div className="mt-5 flex gap-2">{(["11", "12"] as const).map((grade) => <button key={grade} type="button" onClick={() => room.setGrade(grade)} className="min-h-11 rounded-lg border bg-card px-4 text-sm font-semibold">Grade {grade}</button>)}</div></div>}
    {room.state === "error" && <AppError title="Could not open group chat" description={room.error} onRetry={() => window.location.reload()} />}
    {room.state === "ready" && <>
      {room.program.facultySlug === "plus-two" && <div className="mt-3 flex items-center gap-2 text-sm"><span className="text-muted-foreground">Grade</span>{(["11", "12"] as const).map((grade) => <button key={grade} type="button" onClick={() => room.setGrade(grade)} aria-pressed={room.grade === grade} className={`min-h-10 rounded-full px-4 text-sm font-semibold ${room.grade === grade ? "bg-primary text-primary-foreground" : "border bg-card"}`}>{grade}</button>)}</div>}
      {questionId && <div className="mt-4 border-l-2 border-primary bg-primary/5 px-4 py-3"><p className="text-xs font-semibold text-primary">Discuss this MCQ in your group</p><p className="mt-1 text-sm">{questionText || "Loading question…"}</p>{questionText && !questionAllowed && <p className="mt-2 text-sm text-destructive">Switch to the question’s programme before posting.</p>}<Link href="/community" className="mt-2 inline-block text-xs font-semibold text-primary">Clear question</Link></div>}
      <form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); setSearch(searchInput.trim()); }}><label className="relative min-w-0 flex-1"><span className="sr-only">Search messages</span><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search this chat" className="h-11 w-full rounded-lg border bg-card pl-10 pr-3 text-sm" /></label><button type="submit" className="min-h-11 rounded-lg border bg-card px-4 text-sm font-semibold">Search</button></form>
      {search && <button type="button" onClick={() => { setSearch(""); setSearchInput(""); }} className="mt-2 text-xs font-semibold text-primary">Clear search</button>}
      <section aria-label={`${room.roomLabel} messages`} className="mt-4 min-h-[50dvh]">
        {loading && <AppLoading label="Loading messages" variant="questions" />}
        {error && <AppError title="Could not load messages" description={error} onRetry={() => void loadRecent(true)} />}
        {!loading && !error && shownRoom === room.roomSlug && posts.length === 0 && <div className="py-14 text-center"><h2 className="text-base font-bold">{search ? "No matching messages" : "Start the conversation"}</h2><p className="mt-2 text-sm text-muted-foreground">{search ? "Try another search term." : "Ask a question or share something useful with your programme."}</p></div>}
        {!loading && !error && shownRoom === room.roomSlug && posts.length > 0 && <>{hasOlder && <button type="button" disabled={loadingOlder} onClick={() => void loadOlder()} className="mb-4 min-h-10 w-full text-sm font-semibold text-primary disabled:opacity-50">{loadingOlder ? "Loading older messages…" : "Load older messages"}</button>}<div className="divide-y">{[...posts].reverse().map((post) => <PostRow key={post.id} post={post} member={members[post.author_id]} />)}</div></>}
      </section>
      <form onSubmit={(event) => void send(event)} className="sticky bottom-16 z-10 mt-4 border-t bg-background/95 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:bottom-0"><label htmlFor="community-message" className="sr-only">Message your group</label><div className="flex items-end gap-2"><textarea id="community-message" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} maxLength={10000} rows={2} placeholder="Message your group…" className="max-h-40 min-h-12 flex-1 resize-y rounded-lg border bg-card px-3 py-2.5 text-sm leading-6" /><button type="submit" disabled={sending || !draft.trim() || (!!questionId && !questionAllowed)} aria-label="Send message" className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"><Send className="size-5" /></button></div>{sending && <p className="mt-1 text-xs text-muted-foreground">Sending message…</p>}</form>
    </>}
  </LearningPage>;
}

export default function CommunityPage() {
  return <Suspense fallback={<AppLoading label="Opening Community" variant="questions" />}><CommunityChat /></Suspense>;
}
