"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import { clearLocalStudyData } from "@/lib/storage";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  /**
   * Programme slug the student studies. `null` when unknown — including on
   * deployments where migration 007 hasn't been applied yet, so every read
   * site must tolerate it.
   */
  programSlug: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  authRestorationTimedOut: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    programSlug?: string
  ) => Promise<{ error?: string; emailConfirmationRequired?: boolean }>;
  logout: () => void;
  /** `programSlug` is optional — omit it to leave the stored programme alone. */
  updateProfile: (
    name: string,
    programSlug?: string
  ) => Promise<{ error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: string }>;
  deleteAccount: (password: string, confirmation: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Old localStorage keys from the previous auth system
const OLD_CURRENT_USER_KEY = "pharmquiz_current_user";
const OLD_USERS_KEY = "pharmquiz_users";
const LAST_ACCOUNT_KEY = "bujh-last-auth-user";

function rememberAccount(userId: string) {
  if (typeof window === "undefined") return;
  try {
    const previous = localStorage.getItem(LAST_ACCOUNT_KEY);
    if (previous && previous !== userId) clearLocalStudyData();
    localStorage.setItem(LAST_ACCOUNT_KEY, userId);
  } catch {}
}

function clearOldAuthStorage() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(OLD_CURRENT_USER_KEY);
    localStorage.removeItem(OLD_USERS_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authRestorationTimedOut, setAuthRestorationTimedOut] = useState(false);
  const activeUserId = useRef<string | null>(null);

  // Build a User from session data (no DB query needed)
  const userFromSession = useCallback((session: Session): User => {
    const u = session.user;
    const meta = u.user_metadata || {};
    return {
      id: u.id,
      name: meta.name || u.email?.split("@")[0] || "User",
      email: u.email || "",
      // Never trust client-controlled user_metadata for the role — the DB
      // profile row is the only authority. This fallback only runs when the
      // profiles query fails, so default to the least privilege.
      role: "user",
      createdAt: u.created_at || new Date().toISOString(),
      programSlug: meta.program_slug || null,
    };
  }, []);

  // Load user profile — tries DB first, falls back to session data
  const loadProfile = useCallback(async (userId: string): Promise<User | null> => {
    try {
      // Try loading from profiles table via RLS
      const { data, error } = await getSupabase()
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data && !error) {
        const loadedUser: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          createdAt: data.created_at,
          // Absent until migration 007 has been applied.
          programSlug: data.program_slug ?? null,
        };
        if (activeUserId.current === userId) setUser(loadedUser);
        return loadedUser;
      }

      console.warn("loadProfile: DB query failed, falling back to session data:", error?.message);

      // Fallback: build user from session (no RLS needed)
      const { data: { session } } = await getSupabase().auth.getSession();
      if (session?.user) {
        const fallbackUser = userFromSession(session);
        if (activeUserId.current === userId) setUser(fallbackUser);
        return fallbackUser;
      }

      return null;
    } catch (err) {
      console.error("loadProfile unexpected error:", err);

      // Even on error, try session fallback
      try {
        const { data: { session } } = await getSupabase().auth.getSession();
        if (session?.user) {
          const fallbackUser = userFromSession(session);
          if (activeUserId.current === userId) setUser(fallbackUser);
          return fallbackUser;
        }
      } catch {}
      return null;
    }
  }, [userFromSession]);

  // Check for existing session on mount
  useEffect(() => {
    let disposed = false;
    let initialResolved = false;
    const pendingTasks = new Set<ReturnType<typeof setTimeout>>();
    const showSession = (session: Session | null) => {
      if (disposed) return;
      if (session?.user) rememberAccount(session.user.id);
      activeUserId.current = session?.user.id ?? null;
      setUser(session?.user ? userFromSession(session) : null);
      setAuthRestorationTimedOut(false);
    };
    const finishInitialRestore = async (session: Session | null) => {
      showSession(session);
      // Do not expose the application as guest while its signed-in profile is
      // still being restored. The shell stays in its loading state until this
      // request completes, so the sidebar and account-only controls arrive
      // together with the correct student identity and role.
      if (session?.user) await loadProfile(session.user.id);
      if (disposed) return;
      initialResolved = true;
      setAuthRestorationTimedOut(false);
      setIsLoading(false);
    };
    const defer = (work: () => Promise<void>) => {
      const task = setTimeout(() => {
        pendingTasks.delete(task);
        if (!disposed) void work().catch((error) => console.error("Auth follow-up failed:", error));
      }, 0);
      pendingTasks.add(task);
    };
    // INITIAL_SESSION is the single source for restoring a saved session.
    // A second getSession() can race with a new sign-in and restore stale state.
    if (typeof window !== "undefined" && localStorage.getItem(OLD_CURRENT_USER_KEY)) {
      clearOldAuthStorage();
    }

    // A stalled auth event must not leave a spinner forever or incorrectly
    // classify a possibly signed-in student as a guest.
    const loadingLimit = setTimeout(() => {
      if (!disposed && !initialResolved) {
        setAuthRestorationTimedOut(true);
        setIsLoading(false);
      }
    }, 5000);

    // Listen for auth state changes
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange(
      (event, session) => {
        if (disposed) return;
        if (event === "INITIAL_SESSION") {
          void finishInitialRestore(session).catch((error) => {
            console.error("Initial auth restoration failed:", error);
            if (!disposed) {
              initialResolved = true;
              setIsLoading(false);
            }
          });
        } else if (event === "SIGNED_IN" && session?.user) {
          showSession(session);
          initialResolved = true;
          setIsLoading(false);
          // Supabase holds its auth lock while calling this listener. Database
          // reads and writes must start after the callback has returned.
          defer(async () => { await loadProfile(session.user.id); });
          defer(async () => {
            // If user selected a program prior to Google OAuth redirect, persist it to profile
            if (typeof window !== "undefined") {
              const pendingProgram = localStorage.getItem("bujh-pending-program");
              if (pendingProgram) {
                try {
                  const { error: rpcError } = await getSupabase().rpc("update_profile", {
                    p_user_id: session.user.id,
                    p_name:
                      session.user.user_metadata?.name ||
                      session.user.email?.split("@")[0] ||
                      "Student",
                    p_program_slug: pendingProgram,
                  });
                  const { error: updateError } = await getSupabase()
                    .from("profiles")
                    .update({ program_slug: pendingProgram })
                    .eq("id", session.user.id);
                  if (!rpcError || !updateError) localStorage.removeItem("bujh-pending-program");
                  await loadProfile(session.user.id);
                } catch (e) {
                  console.warn("Failed to sync pending program on sign in:", e);
                }
              }
            }
          });
        } else if (event === "SIGNED_OUT") {
          showSession(null);
          initialResolved = true;
          setIsLoading(false);
        }
      }
    );

    return () => {
      disposed = true;
      clearTimeout(loadingLimit);
      pendingTasks.forEach(clearTimeout);
      subscription.unsubscribe();
    };
  }, [loadProfile, userFromSession]);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    programSlug?: string
  ) => {
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        // The signup trigger copies program_slug onto the profile row.
        data: {
          name,
          ...(programSlug ? { program_slug: programSlug } : {}),
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        return { error: "An account with this email already exists" };
      }
      return { error: error.message };
    }

    if (!data.user) {
      return { error: "Registration failed. Please try again." };
    }

    // With Confirm email enabled, Supabase creates the account but deliberately
    // returns no browser session. The profile trigger still receives the
    // metadata above, so do not report a false profile error or enter guest
    // mode. Let the student confirm the email, then sign in normally.
    if (!data.session) {
      return { emailConfirmationRequired: true };
    }

    // Wait briefly for the signup trigger to create the initial profile row
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Explicitly guarantee the chosen programme is saved to profiles table (overriding any trigger default)
    if (programSlug) {
      try {
        await getSupabase().rpc("update_profile", {
          p_user_id: data.user.id,
          p_name: name,
          p_program_slug: programSlug,
        });
      } catch {}
      try {
        await getSupabase()
          .from("profiles")
          .update({ program_slug: programSlug, name })
          .eq("id", data.user.id);
      } catch {}
    }

    const loadedUser = await loadProfile(data.user.id);
    if (!loadedUser) {
      return { error: "Account created but profile setup failed. Please try logging in." };
    }

    return {};
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login")) {
        return { error: "Incorrect email or password" };
      }
      return { error: error.message };
    }

    if (data.session?.user) {
      activeUserId.current = data.session.user.id;
      setUser(userFromSession(data.session));
      // A valid session is enough to enter the app. Profile fields can refresh
      // after navigation instead of holding the login button on a DB request.
      void loadProfile(data.session.user.id);
    }

    return {};
  }, [loadProfile, userFromSession]);

  const updateProfile = useCallback(
    async (name: string, programSlug?: string) => {
      if (!user) return { error: "Not logged in" };

      // Only send the programme when the caller supplied one. Passing null
      // would clear the student's programme, which is never what a rename
      // wants to do.
      const params: Record<string, unknown> = {
        p_user_id: user.id,
        p_name: name,
      };
      if (programSlug !== undefined) params.p_program_slug = programSlug;

      const profilePatch: { name: string; program_slug?: string } = { name };
      if (programSlug !== undefined) profilePatch.program_slug = programSlug;

      try {
        // Use SECURITY DEFINER RPC to bypass RLS (publishable key issue)
        const { error: rpcError } = await getSupabase().rpc(
          "update_profile",
          params
        );

        if (rpcError) {
          console.warn("RPC update failed, trying direct update:", rpcError.message);
          // Fallback: try direct updates. The RPC is the 3-arg overload added
          // in migration 007, so on a pre-007 deployment this path is the one
          // that runs — and a `program_slug` write will be rejected there.
          const { error: dbError } = await getSupabase()
            .from("profiles")
            .update(profilePatch)
            .eq("id", user.id);
          if (dbError) {
            console.warn("Direct profile update failed:", dbError.message);
            return { error: "Could not save your profile. Please try again." };
          }

          const { error: authError } = await getSupabase().auth.updateUser({
            data: {
              name,
              ...(programSlug !== undefined
                ? { program_slug: programSlug }
                : {}),
            },
          });
          if (authError) console.warn("Auth metadata update failed:", authError.message);
        }

        // Reflect the saved values after at least one database write succeeds.
        setUser((prev) =>
          prev
            ? {
                ...prev,
                name,
                ...(programSlug !== undefined ? { programSlug } : {}),
              }
            : null
        );

        return {};
      } catch (err) {
        console.error("updateProfile error:", err);
        return { error: "Failed to update profile" };
      }
    },
    [user]
  );

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user) return { error: "Not logged in" };

    // Verify current password first
    const { error: signInError } = await getSupabase().auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return { error: "Current password is incorrect" };
    }

    // Update password
    const { error } = await getSupabase().auth.updateUser({ password: newPassword });

    if (error) {
      return { error: error.message };
    }

    return {};
  }, [user]);

  const deleteAccount = useCallback(async (password: string, confirmation: string) => {
    if (!user) return { error: "Not logged in" };

    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      if (!session || session.user.id !== user.id) return { error: "Your session has expired. Sign in again." };
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ password, confirmation }),
      });
      if (!response.ok) {
        const result: { error?: string } = await response.json();
        return { error: result.error || "Failed to delete account" };
      }

      // The server deleted auth.users; its foreign-key cascades remove profile
      // data. Clear this device only after that operation succeeds.
      clearLocalStudyData();
      if (typeof window !== "undefined") localStorage.removeItem("bujh-pending-program");

      await getSupabase().auth.signOut({ scope: "local" });
      clearOldAuthStorage();
      setUser(null);

      return {};
    } catch (err) {
      console.error("deleteAccount error:", err);
      return { error: "Failed to delete account" };
    }
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    if (error) return { error: error.message };
    return {};
  }, []);

  const logout = useCallback(async () => {
    await getSupabase().auth.signOut();
    clearLocalStudyData();
    clearOldAuthStorage();
    setUser(null);
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, isLoading, authRestorationTimedOut, isAdmin, login, register, logout, updateProfile, changePassword, deleteAccount, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
