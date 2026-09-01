"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";

export interface StoredNote {
  id: string;
  title: string;
  content: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
}

const NOTES_KEY = "pharmquiz_notes_";

function getStorageKey(userId: string): string {
  return `${NOTES_KEY}${userId}`;
}

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<StoredNote[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadNotes = useCallback(() => {
    if (!user) { setNotes([]); return; }
    try {
      const raw = localStorage.getItem(getStorageKey(user.id));
      setNotes(raw ? JSON.parse(raw) : []);
    } catch {
      setNotes([]);
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
    loadNotes();
  }, [loadNotes]);

  const addNote = useCallback((title: string, content: string, subject: string) => {
    if (!user) return;
    const now = new Date().toISOString();
    const newNote: StoredNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      content,
      subject,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem(getStorageKey(user.id), JSON.stringify(updated));
  }, [user, notes]);

  const updateNote = useCallback((id: string, title: string, content: string, subject: string) => {
    if (!user) return;
    const updated = notes.map((n) =>
      n.id === id ? { ...n, title, content, subject, updatedAt: new Date().toISOString() } : n
    );
    setNotes(updated);
    localStorage.setItem(getStorageKey(user.id), JSON.stringify(updated));
  }, [user, notes]);

  const deleteNote = useCallback((id: string) => {
    if (!user) return;
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem(getStorageKey(user.id), JSON.stringify(updated));
  }, [user, notes]);

  return { notes, mounted, addNote, updateNote, deleteNote, refreshNotes: loadNotes };
}
