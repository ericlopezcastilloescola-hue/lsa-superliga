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
import { SEED_DATA } from "@/lib/data/seed";
import type {
  AppData,
  CreateClubInput,
  CreateCompetitionInput,
  MatchEvent,
  UpdateClubInput,
} from "@/lib/types";
import { MENSAJES } from "@/lib/i18n/es";
import { useAuth } from "@/lib/store/auth-context";

type DataContextValue = {
  data: AppData;
  loading: boolean;
  refresh: () => Promise<void>;
  createClub: (input: CreateClubInput) => Promise<string>;
  updateClub: (id: string, input: UpdateClubInput) => Promise<void>;
  deleteClub: (id: string) => Promise<void>;
  createCompetition: (input: CreateCompetitionInput) => Promise<string>;
  deleteCompetition: (id: string) => Promise<void>;
  addClubToCompetition: (competitionId: string, clubId: string) => Promise<void>;
  removeClubFromCompetition: (competitionId: string, clubId: string) => Promise<void>;
  updateMatchResult: (
    matchId: string,
    result: {
      homeScore: number;
      awayScore: number;
      scorers: MatchEvent[];
      assists: MatchEvent[];
      mvpPlayerId: string | null;
    },
  ) => Promise<string | null>;
  requestJoinClub: (clubId: string) => Promise<void>;
  respondJoinRequest: (requestId: string, action: "accept" | "reject") => Promise<void>;
  generateCompetitionCalendar: (competitionId: string) => Promise<void>;
  createMatchday: (
    competitionId: string,
    name: string,
    startDate: string,
  ) => Promise<void>;
  updateMatchday: (
    competitionId: string,
    matchdayId: string,
    input: { name?: string; startDate?: string; applyDateToMatches?: boolean },
  ) => Promise<void>;
  deleteMatchday: (competitionId: string, matchdayId: string) => Promise<void>;
  deleteMatchdayMatches: (competitionId: string, matchdayId: string) => Promise<void>;
  deleteCompetitionMatch: (competitionId: string, matchId: string) => Promise<void>;
  createCompetitionMatch: (
    competitionId: string,
    input: {
      matchdayId?: string;
      homeClubId: string;
      awayClubId: string;
      scheduledAt: string;
      round?: string;
    },
  ) => Promise<void>;
  transferPlayer: (playerId: string, toClubId: string | null) => Promise<void>;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>(SEED_DATA);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setData(SEED_DATA);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/data");
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      /* keep current */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  const createClub = useCallback(async (input: CreateClubInput) => {
    const res = await fetch("/api/clubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Error al crear club");
    await refresh();
    return body.club.id as string;
  }, [refresh]);

  const updateClub = useCallback(
    async (id: string, input: UpdateClubInput) => {
      await fetch(`/api/clubs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      await refresh();
    },
    [refresh],
  );

  const deleteClub = useCallback(
    async (id: string) => {
      await fetch(`/api/clubs/${id}`, { method: "DELETE" });
      await refresh();
    },
    [refresh],
  );

  const createCompetition = useCallback(
    async (input: CreateCompetitionInput) => {
      const res = await fetch("/api/competitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Error al crear competición");
      await refresh();
      return body.competition.id as string;
    },
    [refresh],
  );

  const deleteCompetition = useCallback(
    async (id: string) => {
      await fetch(`/api/competitions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" }),
      });
      await refresh();
    },
    [refresh],
  );

  const addClubToCompetition = useCallback(
    async (competitionId: string, clubId: string) => {
      await fetch(`/api/competitions/${competitionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addClub", clubId }),
      });
      await refresh();
    },
    [refresh],
  );

  const removeClubFromCompetition = useCallback(
    async (competitionId: string, clubId: string) => {
      await fetch(`/api/competitions/${competitionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeClub", clubId }),
      });
      await refresh();
    },
    [refresh],
  );

  const updateMatchResult = useCallback(
    async (
      matchId: string,
      result: {
        homeScore: number;
        awayScore: number;
        scorers: MatchEvent[];
        assists: MatchEvent[];
        mvpPlayerId: string | null;
      },
    ) => {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      const body = await res.json();
      if (!res.ok) return body.error ?? "Error al guardar";
      await refresh();
      return null;
    },
    [refresh],
  );

  const requestJoinClub = useCallback(
    async (clubId: string) => {
      const res = await fetch(`/api/clubs/${clubId}/join`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Error al solicitar");
      await refresh();
    },
    [refresh],
  );

  const respondJoinRequest = useCallback(
    async (requestId: string, action: "accept" | "reject") => {
      const res = await fetch(`/api/join-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Error al procesar");
      await refresh();
    },
    [refresh],
  );

  const generateCompetitionCalendar = useCallback(
    async (competitionId: string) => {
      const res = await fetch(`/api/competitions/${competitionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generateCalendar" }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Error al generar calendario");
      }
      await refresh();
    },
    [refresh],
  );

  const createMatchday = useCallback(
    async (competitionId: string, name: string, startDate: string) => {
      await fetch(`/api/competitions/${competitionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addMatchday", name, startDate }),
      });
      await refresh();
    },
    [refresh],
  );

  const updateMatchday = useCallback(
    async (
      competitionId: string,
      matchdayId: string,
      input: { name?: string; startDate?: string; applyDateToMatches?: boolean },
    ) => {
      await fetch(`/api/competitions/${competitionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateMatchday", matchdayId, ...input }),
      });
      await refresh();
    },
    [refresh],
  );

  const deleteMatchday = useCallback(
    async (competitionId: string, matchdayId: string) => {
      await fetch(`/api/competitions/${competitionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteMatchday", matchdayId }),
      });
      await refresh();
    },
    [refresh],
  );

  const deleteMatchdayMatches = useCallback(
    async (competitionId: string, matchdayId: string) => {
      await fetch(`/api/competitions/${competitionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteMatchdayMatches", matchdayId }),
      });
      await refresh();
    },
    [refresh],
  );

  const createCompetitionMatch = useCallback(
    async (
      competitionId: string,
      input: {
        matchdayId?: string;
        homeClubId: string;
        awayClubId: string;
        scheduledAt: string;
        round?: string;
      },
    ) => {
      await fetch(`/api/competitions/${competitionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createMatch", ...input }),
      });
      await refresh();
    },
    [refresh],
  );

  const transferPlayer = useCallback(
    async (playerId: string, toClubId: string | null) => {
      const res = await fetch(`/api/players/${playerId}/transfer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toClubId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Error en traspaso");
      await refresh();
    },
    [refresh],
  );

  const deleteCompetitionMatch = useCallback(
    async (competitionId: string, matchId: string) => {
      await fetch(`/api/competitions/${competitionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteMatch", matchId }),
      });
      await refresh();
    },
    [refresh],
  );

  const value = useMemo(
    () => ({
      data,
      loading,
      refresh,
      createClub,
      updateClub,
      deleteClub,
      createCompetition,
      deleteCompetition,
      addClubToCompetition,
      removeClubFromCompetition,
      updateMatchResult,
      requestJoinClub,
      respondJoinRequest,
      generateCompetitionCalendar,
      createMatchday,
      updateMatchday,
      deleteMatchday,
      deleteMatchdayMatches,
      deleteCompetitionMatch,
      createCompetitionMatch,
      transferPlayer,
    }),
    [
      data,
      loading,
      refresh,
      createClub,
      updateClub,
      deleteClub,
      createCompetition,
      deleteCompetition,
      addClubToCompetition,
      removeClubFromCompetition,
      updateMatchResult,
      requestJoinClub,
      respondJoinRequest,
      generateCompetitionCalendar,
      createMatchday,
      updateMatchday,
      deleteMatchday,
      deleteMatchdayMatches,
      deleteCompetitionMatch,
      createCompetitionMatch,
      transferPlayer,
    ],
  );

  if (loading && user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0B0E14]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
        <p className="text-sm text-zinc-500">{MENSAJES.cargando}</p>
      </div>
    );
  }

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function useAppData() {
  return useData().data;
}
