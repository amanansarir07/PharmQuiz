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

  // Load user profile from Supabase — returns the user or null
  const loadProfile = useCallback(async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await getSupabase()
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) {
        console.error("loadProfile query error:", error);

        // Profile might not exist yet — create it as a fallback
        const { data: { session } } = await getSupabase().auth.getSession();
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const { error: insertError } = await getSupabase().from("profiles").upsert({
            id: userId,
            email: session.user.email || "",
            name: meta.name || session.user.email?.split("@")[0] || "User",
            role: "user",
          }, { onConflict: "id" });

          if (insertError) {
            console.error("loadProfile upsert error:", insertError);
            return null;
          }

          // Retry loading after upsert
          const { data: retryData, error: retryError } = await getSupabase()
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (retryError || !retryData) {
            console.error("loadProfile retry error:", retryError);
            return null;
          }

          const user: User = {
            id: retryData.id,
            name: retryData.name,
            email: retryData.email,
            role: retryData.role,
            createdAt: retryData.created_at,
          };
          setUser(user);
          return user;
        }
        return null;
      }

      const loadedUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: data.created_at,
      };
      setUser(loadedUser);
      return loadedUser;
    } catch (err) {
      console.error("loadProfile unexpected error:", err);
      return null;
    }
  }, []);

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

    // The database trigger should auto-create the profile.
    // Wait a moment for it, then load the profile.
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
        return { error: "Login succeeded but could not load profile. Please try again." };
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
