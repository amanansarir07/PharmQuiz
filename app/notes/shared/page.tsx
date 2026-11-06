"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { getSubjectsForProgram, getProgramLabel } from "@/data/registry";
import { getSupabase } from "@/lib/supabase/client";
import { LibraryNav } from "@/components/library-nav";
import { LearningPage, PageHeading } from "@/components/learning-ui";
import { AppError, AppLoading } from "@/components/app-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

type SharedNote = {
  id: string;
  author_id: string;
  program_slug: string;
  subject: string;
  title: string;
  body: string;
  file_path: string | null;
  file_name: string | null;
  status: "pending" | "published" | "rejected";
  created_at: string;
};

const FILE_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const FILE_LIMIT = 10 * 1024 * 1024;

function NoteRow({ note, mine, onOpenFile, busy, review }: {
  note: SharedNote;
  mine: boolean;
  onOpenFile: (note: SharedNote) => void;
  busy?: boolean;
  review?: (note: SharedNote, status: "published" | "rejected") => void;
}) {
  return <article className="border-b py-5 first:pt-0">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="break-words text-base font-semibold">{note.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {note.subject && <>{note.subject} · </>}{getProgramLabel(note.program_slug)} · {new Date(note.created_at).toLocaleDateString()}
          {mine && " · Your note"}
        </p>
      </div>
      {note.status !== "published" && <span className="rounded-full border px-2 py-1 text-xs font-medium text-muted-foreground">{note.status === "pending" ? "Awaiting review" : "Not approved"}</span>}
    </div>
    {note.body && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">{note.body}</p>}
    {note.file_path && <button type="button" onClick={() => onOpenFile(note)} className="mt-3 inline-flex min-h-11 max-w-full items-center gap-2 text-left text-sm font-semibold text-primary hover:underline"><FileText className="size-4 shrink-0" /><span className="truncate">Open {note.file_name}</span></button>}
    {review && <div className="mt-3 flex gap-2"><Button disabled={busy} size="sm" onClick={() => review(note, "published")}>{busy ? "Saving…" : "Approve"}</Button><Button disabled={busy} variant="outline" size="sm" onClick={() => review(note, "rejected")}>Reject</Button></div>}
  </article>;
}

export default function SharedNotesPage() {
  const { user, isAdmin } = useAuth();
  const { program, programSlug } = useActiveProgram();
  const subjects = getSubjectsForProgram(programSlug);
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [queue, setQueue] = useState<SharedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const client = getSupabase();
      const [feedResult, queueResult] = await Promise.all([
        client.from("shared_program_notes").select("*").eq("program_slug", programSlug).order("created_at", { ascending: false }).limit(100),
        isAdmin ? client.from("shared_program_notes").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(100) : Promise.resolve({ data: [], error: null }),
      ]);
      if (feedResult.error) throw feedResult.error;
      if (queueResult.error) throw queueResult.error;
      setNotes((feedResult.data ?? []) as SharedNote[]);
      setQueue((queueResult.data ?? []) as SharedNote[]);
      setError("");
    } catch {
      setError("Could not load shared notes. Check your connection or ask an administrator to apply the notes database update.");
    } finally { setLoading(false); }
  }, [user, isAdmin, programSlug]);

  useEffect(() => { const frame = requestAnimationFrame(() => { void load(); }); return () => cancelAnimationFrame(frame); }, [load]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || saving) return;
    setFormError("");
    if (!title.trim() || (!body.trim() && !file)) { setFormError("Add a title and either note text or a file."); return; }
    if (file && (!FILE_TYPES.includes(file.type) || file.size > FILE_LIMIT)) { setFormError("Choose a PDF or image under 10 MB."); return; }
    setSaving(true);
    try {
      const client = getSupabase();
      let filePath: string | null = null;
      if (file) {
        filePath = `${user.id}/${crypto.randomUUID()}`;
        const { error: uploadError } = await client.storage.from("program-notes").upload(filePath, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
      }
      const { error: saveError } = await client.from("shared_program_notes").insert({
        author_id: user.id, program_slug: programSlug, subject, title: title.trim(), body: body.trim(),
        file_path: filePath, file_name: file?.name ?? null, status: isAdmin ? "published" : "pending",
      });
      if (saveError) {
        if (filePath) await client.storage.from("program-notes").remove([filePath]);
        throw saveError;
      }
      setDialogOpen(false); setTitle(""); setBody(""); setSubject(""); setFile(null);
      toast(isAdmin ? "Note published" : "Note submitted for review", "success");
      await load();
    } catch { setFormError("Could not submit the note. Check your connection and try again."); }
    finally { setSaving(false); }
  }

  async function review(note: SharedNote, status: "published" | "rejected") {
    if (!user || !isAdmin || reviewing) return;
    setReviewing(note.id);
    try {
      const { data, error: reviewError } = await getSupabase().from("shared_program_notes")
        .update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
        .eq("id", note.id).eq("status", "pending").select("id").single();
      if (reviewError || !data) throw reviewError ?? new Error("Note already reviewed");
      toast(status === "published" ? "Note approved" : "Note rejected", "success");
      await load();
    } catch { toast("Could not review note", "error", "Refresh and try again."); }
    finally { setReviewing(null); }
  }

  async function openFile(note: SharedNote) {
    if (!note.file_path) return;
    const { data, error: linkError } = await getSupabase().storage.from("program-notes").createSignedUrl(note.file_path, 60);
    if (linkError || !data) { toast("Could not open file", "error", "Try again."); return; }
    window.location.assign(data.signedUrl);
  }

  const published = notes.filter((note) => note.status === "published" && `${note.title} ${note.body} ${note.subject}`.toLowerCase().includes(search.toLowerCase()));
  const mine = notes.filter((note) => note.author_id === user?.id && note.status !== "published" && !(isAdmin && note.status === "pending"));

  return <LearningPage className="max-w-[900px]">
    <PageHeading eyebrow="Study library" title="Shared notes" description={`Notes for ${program.shortLabel}, shared by learners and reviewed before publication.`} action={<Button onClick={() => setDialogOpen(true)} className="min-h-11">Share a note</Button>} />
    <LibraryNav />
    <div className="mb-6 flex gap-4 border-b text-sm font-semibold" aria-label="Notes sections"><Link href="/notes" className="pb-3 text-muted-foreground hover:text-foreground">My notes</Link><span className="border-b-2 border-primary pb-3 text-primary" aria-current="page">Shared notes</span></div>
    {loading ? <AppLoading label="Loading shared notes" variant="questions" /> : error ? <AppError title="Shared notes unavailable" description={error} onRetry={() => void load()} /> : <>
      {isAdmin && <section className="mb-8" aria-label="Notes awaiting review"><h2 className="text-base font-semibold">Awaiting review ({queue.length})</h2><p className="mt-1 text-sm text-muted-foreground">Submissions from all programmes. Open attachments before approving.</p><div className="mt-4 divide-y border-t">{queue.length ? queue.map((note) => <NoteRow key={note.id} note={note} mine={note.author_id === user?.id} onOpenFile={(item) => void openFile(item)} busy={reviewing === note.id} review={review} />) : <p className="py-5 text-sm text-muted-foreground">No notes need review.</p>}</div></section>}
      {mine.length > 0 && <section className="mb-8"><h2 className="text-base font-semibold">Your submissions</h2><div className="mt-4 divide-y border-t">{mine.map((note) => <NoteRow key={note.id} note={note} mine onOpenFile={(item) => void openFile(item)} />)}</div></section>}
      <section><h2 className="text-base font-semibold">Published notes</h2><label className="mt-4 flex items-center gap-2 rounded-lg border px-3"><Search className="size-4 text-muted-foreground" /><Input aria-label="Search shared notes" placeholder="Search notes" value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 border-0 shadow-none" /></label><div className="mt-5 divide-y border-t">{published.length ? published.map((note) => <NoteRow key={note.id} note={note} mine={note.author_id === user?.id} onOpenFile={(item) => void openFile(item)} />) : <p className="py-8 text-sm text-muted-foreground">{search ? "No notes match your search." : `No published notes for ${program.shortLabel} yet. Share one to help other learners.`}</p>}</div></section>
    </>}
    <Dialog open={dialogOpen} onOpenChange={(open) => { if (!saving) setDialogOpen(open); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>Share a note</DialogTitle></DialogHeader><form onSubmit={(event) => void submit(event)} className="space-y-4"><p className="text-sm text-muted-foreground">For {program.shortLabel}. {isAdmin ? "Your note will publish immediately." : "An admin will review it before others can see it."}</p>{formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}<div><label htmlFor="shared-note-title" className="mb-1.5 block text-sm font-medium">Title</label><Input id="shared-note-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} required /></div><div><label htmlFor="shared-note-subject" className="mb-1.5 block text-sm font-medium">Subject (optional)</label><select id="shared-note-subject" value={subject} onChange={(event) => setSubject(event.target.value)} className="h-11 w-full rounded-lg border bg-background px-3 text-sm"><option value="">All subjects</option>{subjects.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></div><div><label htmlFor="shared-note-body" className="mb-1.5 block text-sm font-medium">Note text (optional if attaching a file)</label><Textarea id="shared-note-body" value={body} onChange={(event) => setBody(event.target.value)} maxLength={20000} rows={6} placeholder="Write what other learners should know…" /></div><div><label htmlFor="shared-note-file" className="mb-1.5 block text-sm font-medium">PDF or image (optional)</label><Input id="shared-note-file" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="h-auto min-h-11 py-2" /><p className="mt-1 text-xs text-muted-foreground">Maximum 10 MB.</p></div><DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={saving || !title.trim() || (!body.trim() && !file)}>{saving ? "Submitting…" : isAdmin ? "Publish note" : "Submit for review"}</Button></DialogFooter></form></DialogContent></Dialog>
  </LearningPage>;
}
