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

  const loadNotes = useCallback(async () => {
    if (!user) { setNotes([]); return; }
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

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
  }, [user]);

  useEffect(() => {
    setMounted(true);
    loadNotes();
  }, [loadNotes]);

  const addNote = useCallback(async (title: string, content: string, subject: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        title,
        content,
        subject,
      })
      .select()
      .single();

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
  }, [user]);

  const updateNote = useCallback(async (id: string, title: string, content: string, subject: string) => {
    if (!user) return;
    await supabase
      .from("notes")
      .update({ title, content, subject, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, title, content, subject, updatedAt: new Date().toISOString() } : n
      )
    );
  }, [user]);

  const deleteNote = useCallback(async (id: string) => {
    if (!user) return;
    await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, [user]);

  return { notes, mounted, addNote, updateNote, deleteNote, refreshNotes: loadNotes };
}
