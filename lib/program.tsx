"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  DEFAULT_PROGRAM_SLUG,
  getProgram,
  getPrograms,
  isProgramAvailable,
} from "@/data/registry";
import type { ProgramMeta } from "@/data/types";
import { useAuth } from "@/lib/auth";
import { safeGetItem, safeSetItem } from "@/lib/storage";

const STORAGE_KEY = "bujh-active-program";
const CHANGE_EVENT = "bujh-active-program-change";

interface ActiveProgramValue {
  /** Slug of the programme the student is currently browsing. */
  programSlug: string;
  program: ProgramMeta;
  /**
   * True once the student has actually picked a programme — either on their
   * profile or on this device. False means `programSlug` is only the fallback,
   * which is the signal first-run prompts use to ask which programme they are
   * in instead of assuming.
   */
  isChosen: boolean;
  /** Programmes with published content — the only ones you can switch to. */
  availablePrograms: ProgramMeta[];
  /**
   * Switch programme. Persists to the profile when signed in, and always to
   * localStorage so the choice survives a sign-out.
   */
  setProgramSlug: (slug: string) => void;
}

const ActiveProgramContext = createContext<ActiveProgramValue | null>(null);

// localStorage is external state, so it is read through useSyncExternalStore
// rather than an effect. That keeps the server and first client render
// identical (both use the default) while still picking up the stored choice
// immediately, with no flash of the wrong programme and no hydration mismatch.

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  // Fires when another tab changes the value.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getStoredChoice(): string {
  const stored = safeGetItem(STORAGE_KEY);
  return stored && getProgram(stored) ? stored : "";
}

/**
 * The programme stored on this device, defaulted. A plain function rather than
 * a hook, for one-shot work that isn't reactive — reading a session's fallback
 * bank, for instance.
 */
export function getStoredProgramSlug(): string {
  return getStoredChoice() || DEFAULT_PROGRAM_SLUG;
}

function getSnapshot(): string {
  return getStoredChoice() || DEFAULT_PROGRAM_SLUG;
}

function getServerSnapshot(): string {
  return DEFAULT_PROGRAM_SLUG;
}

function getNoChoiceSnapshot(): string {
  return "";
}

/**
 * Tracks which programme the student is browsing.
 *
 * Resolution order: the programme saved on their profile (so the choice
 * follows them across devices), then the last one they picked on this device,
 * then the default.
 */
export function ProgramProvider({ children }: { children: React.ReactNode }) {
  const { user, updateProfile } = useAuth();

  const storedSlug = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // The same store read without the default applied, so the UI can tell "this
  // student picked a programme" apart from "we fell back to it". Empty string
  // on the server, so first-run prompts only ever appear after hydration.
  const storedChoice = useSyncExternalStore(
    subscribe,
    getStoredChoice,
    getNoChoiceSnapshot
  );

  const profileSlug =
    user?.programSlug && getProgram(user.programSlug)
      ? user.programSlug
      : null;

  // A deliberate choice made on this device should win immediately over a
  // profile value that may still be stale while the profile update is saving.
  // This prevents the header, dashboard, and quiz setup from disagreeing
  // after switching programmes.
  const programSlug = storedChoice || profileSlug || storedSlug;
  const isChosen = Boolean(storedChoice || profileSlug);

  // Mirror the profile's choice into localStorage so it still applies after a
  // sign-out. Writing to an external system (not setState) is exactly what an
  // effect is for, so this stays clear of the set-state-in-effect lint rule.
  useEffect(() => {
    if (profileSlug && !safeGetItem(STORAGE_KEY)) {
      safeSetItem(STORAGE_KEY, profileSlug);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    }
  }, [profileSlug]);

  const setProgramSlug = useCallback(
    (slug: string) => {
      if (!getProgram(slug)) return;

      // Apply locally first so the UI responds immediately.
      safeSetItem(STORAGE_KEY, slug);
      window.dispatchEvent(new Event(CHANGE_EVENT));

      if (user) {
        // Fire-and-forget. The local switch already happened, and on a
        // deployment without migration 007 this write is expected to fail —
        // that must never block the student from practising.
        void updateProfile(user.name, slug);
      }
    },
    [user, updateProfile]
  );

  const value = useMemo<ActiveProgramValue>(() => {
    const program =
      getProgram(programSlug) ??
      (getProgram(DEFAULT_PROGRAM_SLUG) as ProgramMeta);
    return {
      programSlug,
      program,
      isChosen,
      availablePrograms: getPrograms().filter((p) =>
        isProgramAvailable(p.slug)
      ),
      setProgramSlug,
    };
  }, [programSlug, isChosen, setProgramSlug]);

  return (
    <ActiveProgramContext.Provider value={value}>
      {children}
    </ActiveProgramContext.Provider>
  );
}

export function useActiveProgram(): ActiveProgramValue {
  const ctx = useContext(ActiveProgramContext);
  if (!ctx) {
    throw new Error("useActiveProgram must be used within a ProgramProvider");
  }
  return ctx;
}
