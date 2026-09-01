"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      role: (meta.role as "user" | "admin") || "user",
      createdAt: u.created_at || new Date().toISOString(),
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

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: { name },
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

    // Wait briefly for the trigger to create the profile, then load it
    await new Promise((resolve) => setTimeout(resolve, 1500));

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

  const logout = useCallback(async () => {
    await getSupabase().auth.signOut();
    setUser(null);
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, register, logout }}>
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
