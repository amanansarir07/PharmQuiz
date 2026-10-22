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
  const [error, setError] = useState<string | null>(null);

  const loadBookmarks = useCallback(async () => {
    if (!user) { setBookmarks([]); setMounted(true); return; }
    const { data, error: loadError } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (loadError) { setError("Could not load saved questions."); setMounted(true); return; }
    setError(null);
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
    setMounted(true);
  }, [user]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void loadBookmarks();
    });
    return () => cancelAnimationFrame(frame);
  }, [loadBookmarks]);

  const addBookmark = useCallback(async (bookmark: Omit<StoredBookmark, "id" | "createdAt">) => {
    if (!user) return { error: "Sign in to save questions." };
    const existing = bookmarks.find((b) => b.questionText === bookmark.questionText && b.subjectSlug === bookmark.subjectSlug);
    if (existing) return {};

    const { data, error: saveError } = await supabase
      .from("bookmarks")
      .insert({
        user_id: user.id,
        question_text: bookmark.questionText,
        subject: bookmark.subjectSlug,
        unit: bookmark.unitId,
      })
      .select()
      .single();

    if (saveError || !data) { setError(saveError?.message || "Could not save question."); return { error: saveError?.message || "Could not save question." }; }
    setError(null);
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
    return {};
  }, [user, bookmarks]);

  const removeBookmark = useCallback(async (id: string) => {
    if (!user) return { error: "Sign in to remove saved questions." };
    const { data, error: deleteError } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .single();

    if (deleteError || !data) { setError(deleteError?.message || "Could not remove question."); return { error: deleteError?.message || "Could not remove question." }; }
    setError(null);

    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    return {};
  }, [user]);

  const isBookmarked = useCallback((questionText: string) => {
    return bookmarks.some((b) => b.questionText === questionText);
  }, [bookmarks]);

  const toggleBookmark = useCallback(async (bookmark: Omit<StoredBookmark, "id" | "createdAt">) => {
    const existing = bookmarks.find((b) => b.questionText === bookmark.questionText && b.subjectSlug === bookmark.subjectSlug);
    if (existing) {
      return removeBookmark(existing.id);
    } else {
      return addBookmark(bookmark);
    }
  }, [bookmarks, addBookmark, removeBookmark]);

  return { bookmarks, mounted, error, addBookmark, removeBookmark, isBookmarked, toggleBookmark, refreshBookmarks: loadBookmarks };
}
