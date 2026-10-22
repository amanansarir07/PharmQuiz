"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase/client";

export interface StoredNote {
  id: string;
  title: string;
  content: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
}

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<StoredNote[]>([]);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    if (!user) { setNotes([]); setMounted(true); return; }
    const { data, error: loadError } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (loadError) { setError("Could not load notes. Please try again."); setMounted(true); return; }
    setError(null);
    if (data) {
      setNotes(data.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        subject: n.subject || "",
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      })));
    }
    setMounted(true);
  }, [user]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void loadNotes();
    });
    return () => cancelAnimationFrame(frame);
  }, [loadNotes]);

  const addNote = useCallback(async (title: string, content: string, subject: string) => {
    if (!user) return { error: "Sign in to save notes." };
    const { data, error: saveError } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        title,
        content,
        subject,
      })
      .select()
      .single();

    if (saveError || !data) { setError(saveError?.message || "Could not save note."); return { error: saveError?.message || "Could not save note." }; }
    setError(null);
    if (data) {
      const newNote: StoredNote = {
        id: data.id,
        title: data.title,
        content: data.content,
        subject: data.subject || "",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      setNotes((prev) => [newNote, ...prev]);
    }
    return {};
  }, [user]);

  const updateNote = useCallback(async (id: string, title: string, content: string, subject: string) => {
    if (!user) return { error: "Sign in to edit notes." };
    const { data, error: saveError } = await supabase
      .from("notes")
      .update({ title, content, subject, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("updated_at")
      .single();

    if (saveError || !data) { setError(saveError?.message || "Could not update note."); return { error: saveError?.message || "Could not update note." }; }
    setError(null);

    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, title, content, subject, updatedAt: new Date().toISOString() } : n
      )
    );
    return {};
  }, [user]);

  const deleteNote = useCallback(async (id: string) => {
    if (!user) return { error: "Sign in to delete notes." };
    const { data, error: deleteError } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .single();

    if (deleteError || !data) { setError(deleteError?.message || "Could not delete note."); return { error: deleteError?.message || "Could not delete note." }; }
    setError(null);

    setNotes((prev) => prev.filter((n) => n.id !== id));
    return {};
  }, [user]);

  return { notes, mounted, error, addNote, updateNote, deleteNote, refreshNotes: loadNotes };
}
