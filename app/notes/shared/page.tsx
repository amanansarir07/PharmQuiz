"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { getSubjectsForProgram, getProgramLabel } from "@/data/registry";
import { getSupabase } from "@/lib/supabase/client";
import { LibraryNav } from "@/components/library-nav";
import { NotesNav } from "@/components/notes-nav";
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
type View = "published" | "mine" | "review";
type ShareMode = "write" | "upload";

function NoteRow({ note, mine, onFileAction, fileBusy, busy, review }: {
  note: SharedNote;
  mine: boolean;
  onFileAction: (note: SharedNote, action: "view" | "download") => void;
  fileBusy?: "view" | "download" | null;
  busy?: boolean;
  review?: (note: SharedNote, status: "published" | "rejected") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const longBody = note.body.length > 280;
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
    {note.body && <><p className={`mt-3 whitespace-pre-wrap break-words text-sm leading-6 ${longBody && !expanded ? "line-clamp-4" : ""}`}>{note.body}</p>{longBody && <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className="mt-1 min-h-10 text-sm font-semibold text-primary">{expanded ? "Show less" : "Read full note"}</button>}</>}
    {note.file_path && <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground"><FileText className="size-4 shrink-0" /><span className="truncate">{note.file_name}</span></p>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
        <Button type="button" variant="outline" size="sm" className="min-h-11" disabled={Boolean(fileBusy)} onClick={() => onFileAction(note, "view")}>{fileBusy === "view" ? "Opening…" : "View file"}</Button>
        <Button type="button" variant="outline" size="sm" className="min-h-11" disabled={Boolean(fileBusy)} onClick={() => onFileAction(note, "download")}><Download className="size-4" />{fileBusy === "download" ? "Preparing…" : "Download"}</Button>
      </div>
    </div>}
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
  const [subjectFilter, setSubjectFilter] = useState("");
  const [view, setView] = useState<View>("published");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shareMode, setShareMode] = useState<ShareMode>("write");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [fileAction, setFileAction] = useState<{ id: string; action: "view" | "download" } | null>(null);

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
    if (!title.trim() || (shareMode === "write" && !body.trim()) || (shareMode === "upload" && !file)) { setFormError(shareMode === "write" ? "Add a title and note text." : "Add a title and a PDF or image."); return; }
    if (file && (!FILE_TYPES.includes(file.type) || file.size > FILE_LIMIT)) { setFormError("Choose a PDF or image under 10 MB."); return; }
    setSaving(true);
    try {
      const client = getSupabase();
      let filePath: string | null = null;
      if (shareMode === "upload" && file) {
        filePath = `${user.id}/${crypto.randomUUID()}`;
        const { error: uploadError } = await client.storage.from("program-notes").upload(filePath, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
      }
      const { error: saveError } = await client.from("shared_program_notes").insert({
        author_id: user.id, program_slug: programSlug, subject, title: title.trim(), body: body.trim(),
        file_path: filePath, file_name: shareMode === "upload" ? file?.name ?? null : null, status: isAdmin ? "published" : "pending",
      });
      if (saveError) {
        if (filePath) await client.storage.from("program-notes").remove([filePath]);
        throw saveError;
      }
      setDialogOpen(false); setTitle(""); setBody(""); setSubject(""); setFile(null); setShareMode("write");
      if (!isAdmin) setView("mine");
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

  async function handleFileAction(note: SharedNote, action: "view" | "download") {
    if (!note.file_path) return;
    setFileAction({ id: note.id, action });
    try {
      const { data, error: linkError } = await getSupabase().storage.from("program-notes")
        .createSignedUrl(note.file_path, 60, action === "download" ? { download: note.file_name || true } : undefined);
      if (linkError || !data) throw linkError ?? new Error("No file link");
      if (action === "view") {
        window.location.assign(data.signedUrl);
      } else {
        const link = document.createElement("a");
        link.href = data.signedUrl;
        link.download = note.file_name || "note";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch { toast(action === "download" ? "Could not download file" : "Could not open file", "error", "Try again."); }
    finally { setFileAction(null); }
  }

  const activeSubjectFilter = subjects.some((item) => item.name === subjectFilter) ? subjectFilter : "";
  const published = notes.filter((note) => note.status === "published" && (!activeSubjectFilter || note.subject === activeSubjectFilter) && `${note.title} ${note.body} ${note.subject}`.toLowerCase().includes(search.toLowerCase()));
  const mine = notes.filter((note) => note.author_id === user?.id);
  const showFilters = notes.filter((note) => note.status === "published").length >= 6 || Boolean(search || activeSubjectFilter);
  const views: { id: View; label: string; count?: number }[] = [
    { id: "published", label: "Published" },
    { id: "mine", label: "My shares" },
    ...(isAdmin ? [{ id: "review" as View, label: "Review", count: queue.length }] : []),
  ];

  return <LearningPage className="max-w-[900px]">
    <PageHeading eyebrow="Study library" title="Shared notes" description={`For ${program.shortLabel}`} action={<Button onClick={() => setDialogOpen(true)} className="hidden min-h-11 sm:inline-flex">Share a note</Button>} />
    <div className="hidden sm:block"><LibraryNav /></div>
    <NotesNav />
    <Button onClick={() => setDialogOpen(true)} className="mb-6 min-h-11 w-full sm:hidden">Share a note</Button>

    <div role="group" aria-label="Shared notes views" className="grid grid-cols-2 rounded-lg bg-muted p-1 sm:inline-grid sm:min-w-[300px] sm:grid-flow-col sm:auto-cols-fr" style={isAdmin ? { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" } : undefined}>
      {views.map((item) => <button key={item.id} type="button" aria-pressed={view === item.id} onClick={() => setView(item.id)} className={`min-h-11 rounded-md px-2 text-xs font-semibold sm:px-4 sm:text-sm ${view === item.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{item.label}{item.count ? ` (${item.count})` : ""}</button>)}
    </div>

    {loading ? <div className="mt-6"><AppLoading label="Loading shared notes" variant="questions" /></div> : error ? <div className="mt-6"><AppError title="Shared notes unavailable" description={error} onRetry={() => void load()} /></div> : <>
      {view === "published" && <section aria-label="Published notes" className="mt-6">
        {showFilters && <div className="grid gap-2 sm:grid-cols-[1fr_210px]">
          <label className="flex items-center gap-2 rounded-lg border px-3"><Search className="size-4 shrink-0 text-muted-foreground" /><Input aria-label="Search published notes" placeholder="Search published notes" value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:bg-transparent focus-visible:ring-0" /></label>
          <select aria-label="Filter by subject" value={activeSubjectFilter} onChange={(event) => setSubjectFilter(event.target.value)} className="min-h-11 w-full rounded-lg border bg-background px-3 text-sm"><option value="">All subjects</option>{subjects.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select>
        </div>}
        <div className="mt-5 divide-y border-t">{published.length ? published.map((note) => <NoteRow key={note.id} note={note} mine={note.author_id === user?.id} onFileAction={(item, action) => void handleFileAction(item, action)} fileBusy={fileAction?.id === note.id ? fileAction.action : null} />) : <p className="py-8 text-sm text-muted-foreground">{search || activeSubjectFilter ? "No notes match these filters." : `No published notes for ${program.shortLabel} yet.`}</p>}</div>
      </section>}
      {view === "mine" && <section aria-label="My shared notes" className="mt-6">
        <p className="text-sm text-muted-foreground">Notes you shared for {program.shortLabel}. Pending notes are only visible to you and admins.</p>
        <div className="mt-4 divide-y border-t">{mine.length ? mine.map((note) => <NoteRow key={note.id} note={note} mine onFileAction={(item, action) => void handleFileAction(item, action)} fileBusy={fileAction?.id === note.id ? fileAction.action : null} />) : <p className="py-8 text-sm text-muted-foreground">You haven’t shared a note for this programme yet.</p>}</div>
      </section>}
      {isAdmin && view === "review" && <section aria-label="Notes to review" className="mt-6">
        <p className="text-sm text-muted-foreground">Pending notes from all programmes. Read each note and open its file before approving.</p>
        <div className="mt-4 divide-y border-t">{queue.length ? queue.map((note) => <NoteRow key={note.id} note={note} mine={note.author_id === user?.id} onFileAction={(item, action) => void handleFileAction(item, action)} fileBusy={fileAction?.id === note.id ? fileAction.action : null} busy={reviewing === note.id} review={review} />) : <p className="py-8 text-sm text-muted-foreground">No notes need review.</p>}</div>
      </section>}
    </>}

    <Dialog open={dialogOpen} onOpenChange={(open) => { if (!saving) setDialogOpen(open); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>Share a note</DialogTitle></DialogHeader>
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <p className="text-sm text-muted-foreground">{program.shortLabel} · {isAdmin ? "Publishes immediately" : "Reviewed by an admin before publication"}</p>
          {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
          <div><label htmlFor="shared-note-title" className="mb-1.5 block text-sm font-medium">Title</label><Input id="shared-note-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} required /></div>
          <div><label htmlFor="shared-note-subject" className="mb-1.5 block text-sm font-medium">Subject (optional)</label><select id="shared-note-subject" value={subject} onChange={(event) => setSubject(event.target.value)} className="h-11 w-full rounded-lg border bg-background px-3 text-sm"><option value="">All subjects</option>{subjects.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></div>
          <fieldset><legend className="mb-2 text-sm font-medium">What are you sharing?</legend><div className="grid grid-cols-2 gap-2"><button type="button" aria-pressed={shareMode === "write"} onClick={() => { setShareMode("write"); setFile(null); setFormError(""); }} className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${shareMode === "write" ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted"}`}>Written note</button><button type="button" aria-pressed={shareMode === "upload"} onClick={() => { setShareMode("upload"); setFormError(""); }} className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${shareMode === "upload" ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted"}`}>PDF or image</button></div></fieldset>
          {shareMode === "write" ? <div><label htmlFor="shared-note-body" className="mb-1.5 block text-sm font-medium">Note</label><Textarea id="shared-note-body" value={body} onChange={(event) => setBody(event.target.value)} maxLength={20000} rows={6} placeholder="Write what other learners should know…" required /></div> : <><div><label htmlFor="shared-note-file" className="mb-1.5 block text-sm font-medium">Choose a PDF or image</label><Input id="shared-note-file" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="h-auto min-h-11 py-2" required /><p className="mt-1 text-xs text-muted-foreground">One file, up to 10 MB.</p></div><div><label htmlFor="shared-note-description" className="mb-1.5 block text-sm font-medium">Description (optional)</label><Textarea id="shared-note-description" value={body} onChange={(event) => setBody(event.target.value)} maxLength={20000} rows={3} placeholder="What does this file cover?" /></div></>}
          <DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={saving || !title.trim() || (shareMode === "write" ? !body.trim() : !file)}>{saving ? "Submitting…" : isAdmin ? "Publish note" : "Submit for review"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </LearningPage>;
}
