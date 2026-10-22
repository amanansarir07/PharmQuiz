"use client";

import { useState } from "react";
import { StickyNote, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNotes } from "@/lib/notes";
import { useActiveProgram } from "@/lib/program";
import { getSubjectsForProgram } from "@/data/registry";
import { LibraryNav } from "@/components/library-nav";
import { LearningPage, PageHeading } from "@/components/learning-ui";
import { AppLoading } from "@/components/app-state";

export default function NotesPage() {
  const { notes, mounted, error, addNote, updateNote, deleteNote } = useNotes();
  const { programSlug } = useActiveProgram();
  const subjects = getSubjectsForProgram(programSlug);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const filteredNotes = notes.filter((note) => `${note.title} ${note.content} ${note.subject}`.toLowerCase().includes(search.toLowerCase()));

  const openNewNote = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setSubject("");
    setFormError("");
    setDialogOpen(true);
  };

  const openEditNote = (note: { id: string; title: string; content: string; subject: string }) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setSubject(note.subject);
    setFormError("");
    setDialogOpen(true);
  };

  const saveNote = async () => {
    setSaving(true);
    setFormError("");
    const result = editingId
      ? await updateNote(editingId, title, content, subject)
      : await addNote(title, content, subject);
    setSaving(false);
    if (result.error) { setFormError(result.error); return; }
    setDialogOpen(false);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <LearningPage className="max-w-[1200px]">
      <PageHeading eyebrow="Study library" title="Notes" description="Keep ideas, mnemonics and reminders close to your practice." action={<Button onClick={openNewNote} className="min-h-10 rounded-xl"><Plus className="mr-1.5 size-4" /> New note</Button>} />
      <LibraryNav />
      {notes.length > 0 && <label className="mb-5 flex items-center gap-3 rounded-xl border bg-card px-4"><Search className="size-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a note or mnemonic…" aria-label="Search notes" className="h-12 border-0 bg-transparent shadow-none" /></label>}

      {error && <p role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}

      {!mounted ? (
        <AppLoading label="Loading notes" />
      ) : notes.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-8 text-center sm:p-12">
            <StickyNote className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No notes yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Jot down mnemonics, key points, or anything you want to remember
            </p>
            <Button onClick={openNewNote}>Create Your First Note</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="rounded-2xl border-t-2 border-t-amber-400/70">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="min-w-0 break-words text-base"><button type="button" onClick={() => openEditNote(note)} className="text-left font-semibold hover:text-primary">{note.title}</button></CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditNote(note)}
                      aria-label={`Edit ${note.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(note.id)}
                      aria-label={`Delete ${note.title}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                  {note.content}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
                  {note.subject && <Badge variant="outline">{note.subject}</Badge>}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(note.updatedAt || note.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {mounted && notes.length > 0 && filteredNotes.length === 0 && <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No notes match “{search}”. Try another word.</p>}

      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open && !deleting) setDeleteId(null); }}><DialogContent><DialogHeader><DialogTitle>Delete this note?</DialogTitle><DialogDescription>This removes the note from your study library. It cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" disabled={deleting} onClick={() => setDeleteId(null)}>Keep note</Button><Button variant="destructive" disabled={deleting} onClick={async () => { if (!deleteId) return; setDeleting(true); const result = await deleteNote(deleteId); setDeleting(false); if (!result.error) setDeleteId(null); }}>{deleting ? "Deleting…" : "Delete note"}</Button></DialogFooter></DialogContent></Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Note" : "New Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
            <Input
              aria-label="Note title"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Subject (optional)</p>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={subject === s.name}
                    onClick={() => setSubject(subject === s.name ? "" : s.name)}
                    className={`min-h-10 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      subject === s.name
                        ? "border-primary bg-primary/5 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    {s.icon} {s.name}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              aria-label="Note content"
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => { void saveNote(); }} disabled={!title.trim() || saving}>
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LearningPage>
  );
}
