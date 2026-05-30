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
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/types";
import { fetchWithTimeout } from "@/lib/utils/fetch-with-timeout";

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (input: {
    email: string;
    password: string;
    name: string;
    gamertag: string;
  }) => Promise<string | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAdmin: boolean;
  isCaptain: boolean;
  captainClubId: string | null;
  managedClubIds: string[];
  canManageClub: (clubId: string) => boolean;
  isPrimaryCaptain: (clubId: string) => boolean;
  canEditResults: boolean;
  canReportMatch: (homeClubId: string, awayClubId: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const PUBLIC_AUTH_PATHS = new Set(["/login", "/register"]);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetchWithTimeout("/api/auth/me");
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
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 8000);

    refresh().finally(() => {
      if (!cancelled) {
        clearTimeout(timeout);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
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

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      name: string;
      gamertag: string;
    }) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) return data.error ?? "Error al registrarse";
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

  const value = useMemo(() => {
    const managedClubIds = user?.managedClubIds ?? [];
    const canManageClub = (clubId: string) =>
      user?.role === "admin" || managedClubIds.includes(clubId);
    const isPrimaryCaptain = (clubId: string) => user?.captainClubId === clubId;
    const canReportMatch = (homeClubId: string, awayClubId: string) =>
      user?.role === "admin" ||
      managedClubIds.includes(homeClubId) ||
      managedClubIds.includes(awayClubId);

    return {
      user,
      loading,
      login,
      register,
      logout,
      refresh,
      isAdmin: user?.role === "admin",
      isCaptain: managedClubIds.length > 0,
      captainClubId: user?.captainClubId ?? null,
      managedClubIds,
      canManageClub,
      isPrimaryCaptain,
      canEditResults: user?.role === "admin",
      canReportMatch,
    };
  }, [user, loading, login, register, logout, refresh]);

  const isPublicAuth = PUBLIC_AUTH_PATHS.has(pathname);
  const showBlockingLoader = loading && !isPublicAuth;

  if (showBlockingLoader) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0B0E14]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
        <p className="text-sm text-zinc-500">Cargando LSA Superliga…</p>
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
