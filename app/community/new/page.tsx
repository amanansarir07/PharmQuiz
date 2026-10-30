"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSubjectsForProgram, getProgram } from "@/data/registry";
import { useActiveProgram } from "@/lib/program";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase/client";
import { communityError } from "@/lib/community";
import { toast } from "@/components/ui/toast";
import { LearningPage } from "@/components/learning-ui";
import { AppLoading } from "@/components/app-state";

function NewDiscussion() {
  const router = useRouter();
  const params = useSearchParams();
  const questionId = params.get("question");
  const { user } = useAuth();
  const { programSlug } = useActiveProgram();
  const program = getProgram(programSlug);
  const subjects = useMemo(() => getSubjectsForProgram(programSlug), [programSlug]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [faculty, setFaculty] = useState(program?.facultySlug ?? "");
  const [subject, setSubject] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!questionId) return;
    let cancelled = false;
    void getSupabase().from("published_questions").select("question_text,subject_slug,program_slug")
      .eq("id", questionId).maybeSingle().then(({ data }) => {
        if (cancelled || !data) return;
        setQuestionText(data.question_text);
        setTitle((current) => current || `Help me understand: ${data.question_text}`.slice(0, 180));
        setSubject(data.subject_slug);
        setFaculty(data.program_slug.startsWith("plus-two") ? "plus-two" : "ctevt");
      });
    return () => { cancelled = true; };
  }, [questionId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) { router.push("/auth/login"); return; }
    if (title.trim().length < 12 || body.trim().length < 20) {
      setError("Add a clear title and at least 20 characters of context."); return;
    }
    setPending(true); setError("");
    const { data, error: saveError } = await getSupabase().from("community_posts")
      .insert({ author_id: user.id, title: title.trim(), body: body.trim(),
        faculty_slug: faculty || null, subject_slug: subject || null, question_id: questionId || null })
      .select("id").single();
    setPending(false);
    if (saveError || !data) { setError(communityError(saveError)); return; }
    toast("Discussion posted", "success");
    router.push(`/community/${data.id}`);
  }

  return <LearningPage className="max-w-[760px]">
    <Link href="/community" className="text-sm font-semibold text-primary">Back to Community</Link>
    <h1 className="mt-5 text-2xl font-bold tracking-tight">Ask the Community</h1>
    <p className="mt-1 text-sm text-muted-foreground">A specific question and what you have tried help others give a useful answer.</p>
    {questionText && <div className="mt-6 border-l-2 border-primary bg-primary/5 px-4 py-3"><p className="text-xs font-semibold text-primary">Linked MCQ</p><p className="mt-1 text-sm">{questionText}</p></div>}
    {!user && <p className="mt-6 rounded-lg border bg-card p-4 text-sm">Sign in to post. You can still read Community discussions. <Link href="/auth/login" className="font-semibold text-primary">Log in</Link></p>}
    {user && <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-5">
      <div><label htmlFor="community-title" className="mb-2 block text-sm font-semibold">Title</label><input id="community-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} required minLength={12} placeholder="What are you trying to understand?" className="h-12 w-full rounded-lg border bg-card px-3 text-sm" /><p className="mt-1 text-xs text-muted-foreground">12–180 characters</p></div>
      <div><label htmlFor="community-body" className="mb-2 block text-sm font-semibold">Details</label><textarea id="community-body" value={body} onChange={(event) => setBody(event.target.value)} maxLength={10000} required minLength={20} rows={8} placeholder="Explain the topic, where you got stuck, and what you have already checked." className="w-full resize-y rounded-lg border bg-card p-3 text-sm leading-6" /><p className="mt-1 text-xs text-muted-foreground">Use plain text. Do not include private patient information.</p></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="community-faculty" className="mb-2 block text-sm font-semibold">Stream (optional)</label><select id="community-faculty" value={faculty} onChange={(event) => setFaculty(event.target.value)} className="h-11 w-full rounded-lg border bg-card px-3 text-sm"><option value="">No stream</option><option value="ctevt">CTEVT</option><option value="plus-two">+2</option><option value="npc">Pharmacy Council</option></select></div><div><label htmlFor="community-subject" className="mb-2 block text-sm font-semibold">Subject (optional)</label><select id="community-subject" value={subject} onChange={(event) => setSubject(event.target.value)} className="h-11 w-full rounded-lg border bg-card px-3 text-sm"><option value="">No subject</option>{!subjects.some((item) => item.slug === subject) && subject && <option value={subject}>{subject.replaceAll("-", " ")}</option>}{subjects.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></div></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center gap-3"><button type="submit" disabled={pending || !user} className="min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{pending ? "Posting…" : "Post discussion"}</button><Link href="/community" className="min-h-11 px-3 py-3 text-sm font-semibold text-muted-foreground">Cancel</Link></div>
    </form>}
  </LearningPage>;
}

export default function NewCommunityPostPage() {
  return <Suspense fallback={<AppLoading label="Preparing discussion" />}><NewDiscussion /></Suspense>;
}
