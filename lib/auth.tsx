"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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

const USERS_KEY = "pharmquiz_users";
const CURRENT_USER_KEY = "pharmquiz_current_user";

function getUsers(): Record<string, { user: User; password: string }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, { user: User; password: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const users = getUsers();
    const entry = users[email.toLowerCase()];

    if (!entry) {
      return { error: "No account found with this email" };
    }

    if (entry.password !== password) {
      return { error: "Incorrect password" };
    }

    setUser(entry.user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(entry.user));
    return {};
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const users = getUsers();
    const normalizedEmail = email.toLowerCase();

    if (users[normalizedEmail]) {
      return { error: "An account with this email already exists" };
    }

    // Only specific email gets admin role
    const isAdminEmail = normalizedEmail === "amanansari.np07@gmail.com";

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email: normalizedEmail,
      role: isAdminEmail ? "admin" : "user",
      createdAt: new Date().toISOString(),
    };

    users[normalizedEmail] = { user: newUser, password };
    saveUsers(users);
    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return {};
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
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
