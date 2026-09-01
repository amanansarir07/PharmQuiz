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

  // Load user profile from Supabase
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await getSupabase()
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("loadProfile query error:", error);
        // Profile might not exist yet (trigger hasn't fired), create it
        const { data: { session } } = await getSupabase().auth.getSession();
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          await getSupabase().from("profiles").upsert({
            id: userId,
            email: session.user.email || "",
            name: meta.name || session.user.email?.split("@")[0] || "User",
            role: "user",
          }, { onConflict: "id" });
          // Retry loading
          const { data: retryData } = await getSupabase()
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
          if (retryData) {
            setUser({
              id: retryData.id,
              name: retryData.name,
              email: retryData.email,
              role: retryData.role,
              createdAt: retryData.created_at,
            });
          }
        }
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          createdAt: data.created_at,
        });
      }
    } catch (err) {
      console.error("loadProfile unexpected error:", err);
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await getSupabase().auth.getSession();
      if (session?.user) {
        await loadProfile(session.user.id);
      }
      setIsLoading(false);
    };
    init();

    // Listen for auth state changes
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          await loadProfile(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    // Sign up with Supabase Auth (trigger will create profile)
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await loadProfile(data.user.id);

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
      await loadProfile(data.user.id);
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
