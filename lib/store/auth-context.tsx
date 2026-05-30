"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SessionUser } from "@/lib/types";
import { MENSAJES } from "@/lib/i18n/es";

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  verifyRegister: (input: { email: string; code: string }) => Promise<string | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAdmin: boolean;
  isCaptain: boolean;
  captainClubId: string | null;
  canEditResults: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Error al iniciar sesión";
    setUser(data.user);
    return null;
  }, []);

  const verifyRegister = useCallback(
    async (input: { email: string; code: string }) => {
      const res = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) return data.error ?? "Error al verificar el código";
      setUser(data.user);
      return null;
    },
    [],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      verifyRegister,
      logout,
      refresh,
      isAdmin: user?.role === "admin",
      isCaptain: !!user?.captainClubId,
      captainClubId: user?.captainClubId ?? null,
      canEditResults: user?.role === "admin",
    }),
    [user, loading, login, verifyRegister, logout, refresh],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0B0E14]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
        <p className="text-sm text-zinc-500">{MENSAJES.cargando}</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
