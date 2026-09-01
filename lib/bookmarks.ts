"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";

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

const BOOKMARKS_PREFIX = "pharmquiz_bookmarks_";

function getStorageKey(userId: string): string {
  return `${BOOKMARKS_PREFIX}${userId}`;
}

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<StoredBookmark[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadBookmarks = useCallback(() => {
    if (!user) { setBookmarks([]); return; }
    try {
      const raw = localStorage.getItem(getStorageKey(user.id));
      setBookmarks(raw ? JSON.parse(raw) : []);
    } catch {
      setBookmarks([]);
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
    loadBookmarks();
  }, [loadBookmarks]);

  const addBookmark = useCallback((bookmark: Omit<StoredBookmark, "id" | "createdAt">) => {
    if (!user) return;
    const existing = bookmarks.find((b) => b.questionText === bookmark.questionText);
    if (existing) return; // already bookmarked

    const newBookmark: StoredBookmark = {
      ...bookmark,
      id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newBookmark, ...bookmarks];
    setBookmarks(updated);
    localStorage.setItem(getStorageKey(user.id), JSON.stringify(updated));
  }, [user, bookmarks]);

  const removeBookmark = useCallback((id: string) => {
    if (!user) return;
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem(getStorageKey(user.id), JSON.stringify(updated));
  }, [user, bookmarks]);

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
