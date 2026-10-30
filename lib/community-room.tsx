"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/lib/auth";
import { useActiveProgram } from "@/lib/program";
import { getSupabase } from "@/lib/supabase/client";
import { communityError } from "@/lib/community";
import { safeGetItem, safeSetItem } from "@/lib/storage";

const GRADE_KEY = "bujh-community-grade";
const GRADE_EVENT = "bujh-community-grade-change";
type Grade = "11" | "12";
type RoomState = "loading" | "guest" | "choose-program" | "choose-grade" | "ready" | "error";

function subscribeGrade(listener: () => void) {
  window.addEventListener(GRADE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(GRADE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function gradeFor(programSlug: string): Grade | null {
  const saved = safeGetItem(`${GRADE_KEY}-${programSlug}`);
  return saved === "11" || saved === "12" ? saved : null;
}

// Keep membership changes ordered when someone switches programmes quickly.
let selectionQueue: Promise<void> = Promise.resolve();
function selectRoom(roomSlug: string): Promise<void> {
  const result = selectionQueue.catch(() => {}).then(async () => {
    const { error } = await getSupabase().rpc("community_select_room", { p_room_slug: roomSlug });
    if (error) throw error;
  });
  selectionQueue = result.catch(() => {});
  return result;
}

export function useCommunityRoom() {
  const { user, isLoading } = useAuth();
  const { programSlug, program, isChosen } = useActiveProgram();
  const isPlusTwo = program.facultySlug === "plus-two";
  const grade = useSyncExternalStore(subscribeGrade,
    () => gradeFor(programSlug), () => null);
  const roomSlug = isPlusTwo ? grade ? `${programSlug}-g${grade}` : null : programSlug;
  const roomLabel = isPlusTwo && grade ? `${program.shortLabel} · Grade ${grade}` : program.shortLabel;
  const [selectedRoom, setSelectedRoom] = useState("");
  const [error, setError] = useState("");
  const requestId = useRef(0);

  useEffect(() => {
    if (isLoading || !user || !isChosen || !roomSlug) return;
    const request = ++requestId.current;
    const frame = requestAnimationFrame(() => {
      setError("");
      void selectRoom(roomSlug).then(() => {
        if (request === requestId.current) setSelectedRoom(`${user.id}:${roomSlug}`);
      }).catch((cause) => {
        if (request === requestId.current) setError(communityError(cause));
      });
    });
    return () => { requestId.current += 1; cancelAnimationFrame(frame); };
  }, [isLoading, user, isChosen, roomSlug]);

  const state: RoomState = isLoading ? "loading" : !user ? "guest" : !isChosen
    ? "choose-program" : !roomSlug ? "choose-grade" : error ? "error"
    : selectedRoom === `${user.id}:${roomSlug}` ? "ready" : "loading";
  const setGrade = (next: Grade) => {
    safeSetItem(`${GRADE_KEY}-${programSlug}`, next);
    window.dispatchEvent(new Event(GRADE_EVENT));
  };
  return { state, error, roomSlug, roomLabel, program, grade, setGrade, user };
}
