"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase/client";

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
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    programSlug?: string
  ) => Promise<{ error?: string }>;
  logout: () => void;
  /** `programSlug` is optional — omit it to leave the stored programme alone. */
  updateProfile: (
    name: string,
    programSlug?: string
  ) => Promise<{ error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: string }>;
  deleteAccount: (password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Old localStorage keys from the previous auth system
const OLD_CURRENT_USER_KEY = "pharmquiz_current_user";
const OLD_USERS_KEY = "pharmquiz_users";

function clearOldAuthStorage() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(OLD_CURRENT_USER_KEY);
    localStorage.removeItem(OLD_USERS_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Build a User from session data (no DB query needed)
  const userFromSession = useCallback((session: any): User => {
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
        setUser(loadedUser);
        return loadedUser;
      }

      console.warn("loadProfile: DB query failed, falling back to session data:", error?.message);

      // Fallback: build user from session (no RLS needed)
      const { data: { session } } = await getSupabase().auth.getSession();
      if (session?.user) {
        const fallbackUser = userFromSession(session);
        setUser(fallbackUser);
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
          setUser(fallbackUser);
          return fallbackUser;
        }
      } catch {}
      return null;
    }
  }, [userFromSession]);

  // Check for existing session on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Clear any old localStorage-based auth sessions
        const oldUser = typeof window !== "undefined" ? localStorage.getItem(OLD_CURRENT_USER_KEY) : null;
        if (oldUser) {
          console.log("Detected old localStorage auth session — clearing it");
          clearOldAuthStorage();
        }

        const { data: { session } } = await getSupabase().auth.getSession();
        if (session?.user) {
          await loadProfile(session.user.id);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      }
      setIsLoading(false);
    };
    init();

    // Listen for auth state changes
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (event === "SIGNED_IN" && session?.user) {
            // If user selected a program prior to Google OAuth redirect, persist it to profile
            if (typeof window !== "undefined") {
              const pendingProgram =
                localStorage.getItem("bujh-pending-program") ||
                localStorage.getItem("bujh-active-program");
              if (pendingProgram) {
                try {
                  await getSupabase().rpc("update_profile", {
                    p_user_id: session.user.id,
                    p_name:
                      session.user.user_metadata?.name ||
                      session.user.email?.split("@")[0] ||
                      "Student",
                    p_program_slug: pendingProgram,
                  });
                  await getSupabase()
                    .from("profiles")
                    .update({ program_slug: pendingProgram })
                    .eq("id", session.user.id);
                  localStorage.removeItem("bujh-pending-program");
                } catch (e) {
                  console.warn("Failed to sync pending program on sign in:", e);
                }
              }
            }
            await loadProfile(session.user.id);
          } else if (event === "SIGNED_OUT") {
            setUser(null);
          }
        } catch (err) {
          console.error("Auth state change error:", err);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

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

    if (data.user) {
      const loadedUser = await loadProfile(data.user.id);
      if (!loadedUser) {
        return { error: "Login failed. Please try again." };
      }
    }

    return {};
  }, [loadProfile]);

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
          if (dbError) console.warn("Direct profile update failed:", dbError.message);

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

        // Update local state. This is what makes the programme switcher react
        // immediately, even when every write above failed.
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

  const deleteAccount = useCallback(async (password: string) => {
    if (!user) return { error: "Not logged in" };

    // Verify password first
    const { error: signInError } = await getSupabase().auth.signInWithPassword({
      email: user.email,
      password: password,
    });

    if (signInError) {
      return { error: "Incorrect password" };
    }

    try {
      // Delete user data from profiles (RPC bypasses RLS)
      // Note: Supabase doesn't allow client-side user deletion directly.
      // We delete the profile and sign out. The auth user remains but is unusable.
      const { error: dbError } = await getSupabase()
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (dbError) {
        console.warn("Profile delete failed:", dbError.message);
      }

      // Clear local data
      if (typeof window !== "undefined") {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("quiz-") || key.startsWith("bookmark") || key.startsWith("notes"))) {
            localStorage.removeItem(key);
          }
        }
      }

      // Sign out
      await getSupabase().auth.signOut();
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
    clearOldAuthStorage();
    setUser(null);
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, register, logout, updateProfile, changePassword, deleteAccount, signInWithGoogle }}>
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
