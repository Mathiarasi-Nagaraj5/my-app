"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signup: (fullName: string, email: string, password: string, phone?: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.success ? data.data : null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const login: AuthContextValue["login"] = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) return { ok: false, message: data.message ?? "login failed" };
    setUser(data.data);
    return { ok: true };
  };

  // Separate call from `login` — hits /api/auth/admin-login, which never
  // issues a cookie unless the account's role is actually "admin". This is
  // what AdminLoginPage should call, not `login`.
  const adminLogin: AuthContextValue["adminLogin"] = async (email, password) => {
    const res = await fetch("/api/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) return { ok: false, message: data.message ?? "login failed" };
    setUser(data.data);
    return { ok: true };
  };

  const signup: AuthContextValue["signup"] = async (fullName, email, password, phone) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password, phone }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) return { ok: false, message: data.message ?? "signup failed" };
    setUser(data.data);
    return { ok: true };
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, adminLogin, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}