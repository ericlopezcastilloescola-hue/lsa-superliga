import type { SessionUser } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { buildAppData } from "@/lib/db/mappers";
import type { AppData } from "@/lib/types";

async function fetchCoCaptainsSafe() {
  try {
    return await prisma.clubCoCaptain.findMany({
      select: { clubId: true, userId: true },
    });
  } catch {
    return [];
  }
}

async function fetchMatchReportsSafe() {
  try {
    return await prisma.matchReport.findMany({
      include: {
        club: { select: { name: true } },
        submittedBy: { include: { player: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function fetchAllData(): Promise<AppData> {
  const [
    clubs,
    coCaptains,
    players,
    competitions,
    matchdays,
    matches,
    knockoutRounds,
    transfers,
    joinRequests,
    matchReports,
  ] = await Promise.all([
    prisma.club.findMany({ orderBy: { createdAt: "asc" } }),
    fetchCoCaptainsSafe(),
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
    fetchMatchReportsSafe(),
  ]);

  return buildAppData({
    clubs,
    coCaptains,
    players,
    competitions,
    matchdays,
    matches,
    knockoutRounds,
    transfers,
    joinRequests,
    matchReports,
  });
}

export async function fetchDataForUser(session: SessionUser): Promise<AppData> {
  const full = await fetchAllData();

  let joinRequests = full.joinRequests;
  let matchReports = full.matchReports;
  if (session.role !== "admin") {
    const captainClubIds = new Set<string>(session.managedClubIds);
    joinRequests = full.joinRequests.filter(
      (jr) =>
        jr.userId === session.id ||
        (jr.status === "pending" && captainClubIds.has(jr.clubId)),
    );
    const involvedMatchIds = new Set(
      full.matches
        .filter(
          (m) =>
            (m.homeClubId && captainClubIds.has(m.homeClubId)) ||
            (m.awayClubId && captainClubIds.has(m.awayClubId)),
        )
        .map((m) => m.id),
    );
    matchReports = full.matchReports.filter(
      (r) =>
        r.submittedById === session.id ||
        captainClubIds.has(r.clubId) ||
        involvedMatchIds.has(r.matchId),
    );
  }

  return {
    ...full,
    joinRequests,
    matchReports,
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
