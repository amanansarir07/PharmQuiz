"use client";

import { useState } from "react";
import { StickyNote, Plus, Pencil, Trash2 } from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { useNotes } from "@/lib/notes";
import { useActiveProgram } from "@/lib/program";
import { getSubjectsForProgram } from "@/data/registry";
import { LearningPage, PageHeading } from "@/components/learning-ui";
import { AppLoading } from "@/components/app-state";

export default function NotesPage() {
  const { notes, mounted, addNote, updateNote, deleteNote } = useNotes();
  const { programSlug } = useActiveProgram();
  const subjects = getSubjectsForProgram(programSlug);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");

  const openNewNote = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setSubject("");
    setDialogOpen(true);
  };

  const openEditNote = (note: { id: string; title: string; content: string; subject: string }) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setSubject(note.subject);
    setDialogOpen(true);
  };

  const saveNote = () => {
    if (editingId) {
      updateNote(editingId, title, content, subject);
    } else {
      addNote(title, content, subject);
    }
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
    <LearningPage className="max-w-5xl">
      <PageHeading eyebrow="Study library" title="Notes" description="Keep ideas, mnemonics and reminders close to your practice." action={<Button onClick={openNewNote} className="min-h-10 rounded-xl"><Plus className="mr-1.5 size-4" /> New note</Button>} />

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
          {notes.map((note) => (
            <Card key={note.id} className="rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{note.title}</CardTitle>
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
                      onClick={() => deleteNote(note.id)}
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
                <div className="mt-3 flex items-center gap-2">
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85dvh] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Note" : "New Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
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
                    onClick={() => setSubject(s.name)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
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
            <Button onClick={saveNote} disabled={!title.trim()}>
              {editingId ? "Save Changes" : "Add Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LearningPage>
  );
}
