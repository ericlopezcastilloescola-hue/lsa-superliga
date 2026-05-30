import type { SessionUser } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { buildAppData } from "@/lib/db/mappers";
import type { AppData } from "@/lib/types";

export async function fetchAllData(): Promise<AppData> {
  const [clubs, players, competitions, matchdays, matches, knockoutRounds, transfers, joinRequests] =
    await Promise.all([
      prisma.club.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.player.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.competition.findMany({
        include: { clubs: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.matchday.findMany({ orderBy: { number: "asc" } }),
      prisma.match.findMany({ orderBy: { scheduledAt: "asc" } }),
      prisma.knockoutRound.findMany({ orderBy: { order: "asc" } }),
      prisma.transferRecord.findMany({ orderBy: { date: "desc" } }),
      prisma.joinRequest.findMany({
        include: { user: { include: { player: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return buildAppData({
    clubs,
    players,
    competitions,
    matchdays,
    matches,
    knockoutRounds,
    transfers,
    joinRequests,
  });
}

export async function fetchDataForUser(session: SessionUser): Promise<AppData> {
  const full = await fetchAllData();

  let joinRequests = full.joinRequests;
  if (session.role !== "admin") {
    const captainClubIds = new Set<string>();
    if (session.captainClubId) captainClubIds.add(session.captainClubId);
    joinRequests = full.joinRequests.filter(
      (jr) =>
        jr.userId === session.id ||
        (jr.status === "pending" && captainClubIds.has(jr.clubId)),
    );
  }

  return {
    ...full,
    joinRequests,
  };
}

export async function getUserClubId(playerId: string | null): Promise<string | null> {
  if (!playerId) return null;
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { clubId: true },
  });
  return player?.clubId ?? null;
}

export async function recalculateAllPlayerStats() {
  const [players, matches] = await Promise.all([
    prisma.player.findMany(),
    prisma.match.findMany({ where: { status: "finished" } }),
  ]);

  const stats = new Map<
    string,
    { goals: number; assists: number; mvpAwards: number; matchesPlayed: number }
  >();

  for (const p of players) {
    stats.set(p.id, { goals: 0, assists: 0, mvpAwards: 0, matchesPlayed: 0 });
  }

  for (const m of matches) {
    let scorers: { playerId: string }[] = [];
    let assists: { playerId: string }[] = [];
    try {
      scorers = JSON.parse(m.scorers);
      assists = JSON.parse(m.assists);
    } catch {
      /* ignore */
    }

    const squadIds = new Set<string>();
    for (const s of scorers) squadIds.add(s.playerId);
    for (const a of assists) squadIds.add(a.playerId);
    if (m.mvpPlayerId) squadIds.add(m.mvpPlayerId);

    for (const pid of squadIds) {
      const s = stats.get(pid);
      if (s) s.matchesPlayed += 1;
    }

    for (const s of scorers) {
      const st = stats.get(s.playerId);
      if (st) st.goals += 1;
    }
    for (const a of assists) {
      const st = stats.get(a.playerId);
      if (st) st.assists += 1;
    }
    if (m.mvpPlayerId) {
      const st = stats.get(m.mvpPlayerId);
      if (st) st.mvpAwards += 1;
    }
  }

  await Promise.all(
    players.map((p) => {
      const s = stats.get(p.id)!;
      return prisma.player.update({
        where: { id: p.id },
        data: s,
      });
    }),
  );
}

export async function validateMatchSquadPlayers(
  matchId: string,
  playerIds: string[],
): Promise<string | null> {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return "Partido no encontrado.";

  const clubIds = [match.homeClubId, match.awayClubId].filter(
    (id): id is string => id != null,
  );
  const allowed = await prisma.player.findMany({
    where: {
      id: { in: playerIds },
      clubId: { in: clubIds },
    },
    select: { id: true },
  });
  const allowedIds = new Set(allowed.map((p) => p.id));

  for (const pid of playerIds) {
    if (!allowedIds.has(pid)) {
      return "Solo jugadores de los equipos del partido pueden recibir goles o asistencias.";
    }
  }
  return null;
}
