"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

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
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: data.created_at,
      });
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadProfile(session.user.id);
      }
      setIsLoading(false);
    };
    init();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
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
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
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

    // Check if this is the first user (make them admin)
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const role = count === 0 ? "admin" : "user";

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        email: email.toLowerCase(),
        name,
        role,
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return { error: "Failed to create profile. Please try again." };
    }

    setUser({
      id: data.user.id,
      name,
      email: email.toLowerCase(),
      role,
      createdAt: new Date().toISOString(),
    });

    return {};
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
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
    await supabase.auth.signOut();
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
