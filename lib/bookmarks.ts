"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase/client";

export interface StoredBookmark {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: string;
  unitId: string;
  subjectSlug: string;
  createdAt: string;
}

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<StoredBookmark[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadBookmarks = useCallback(async () => {
    if (!user) { setBookmarks([]); return; }
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setBookmarks(data.map((b) => ({
        id: b.id,
        questionText: b.question_text,
        options: [],
        correctIndex: 0,
        explanation: "",
        difficulty: "",
        unitId: b.unit || "",
        subjectSlug: b.subject,
        createdAt: b.created_at,
      })));
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
    loadBookmarks();
  }, [loadBookmarks]);

  const addBookmark = useCallback(async (bookmark: Omit<StoredBookmark, "id" | "createdAt">) => {
    if (!user) return;
    const existing = bookmarks.find((b) => b.questionText === bookmark.questionText);
    if (existing) return;

    const { data } = await supabase
      .from("bookmarks")
      .insert({
        user_id: user.id,
        question_text: bookmark.questionText,
        subject: bookmark.subjectSlug,
        unit: bookmark.unitId,
      })
      .select()
      .single();

    if (data) {
      const newBookmark: StoredBookmark = {
        id: data.id,
        questionText: data.question_text,
        options: bookmark.options,
        correctIndex: bookmark.correctIndex,
        explanation: bookmark.explanation,
        difficulty: bookmark.difficulty,
        unitId: data.unit || "",
        subjectSlug: data.subject,
        createdAt: data.created_at,
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
    }
  }, [user, bookmarks]);

  const removeBookmark = useCallback(async (id: string) => {
    if (!user) return;
    await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, [user]);

  const isBookmarked = useCallback((questionText: string) => {
    return bookmarks.some((b) => b.questionText === questionText);
  }, [bookmarks]);

  const toggleBookmark = useCallback((bookmark: Omit<StoredBookmark, "id" | "createdAt">) => {
    const existing = bookmarks.find((b) => b.questionText === bookmark.questionText);
    if (existing) {
      removeBookmark(existing.id);
    } else {
      addBookmark(bookmark);
    }
  }, [bookmarks, addBookmark, removeBookmark]);

  return { bookmarks, mounted, addBookmark, removeBookmark, isBookmarked, toggleBookmark, refreshBookmarks: loadBookmarks };
}
