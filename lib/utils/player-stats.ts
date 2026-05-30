import type { AppData, Match, Player } from "@/lib/types";

/** Recalcula goles, asistencias, MVP y partidos jugados desde todos los partidos finalizados. */
export function recalculatePlayerStats(
  players: Player[],
  matches: Match[],
): Player[] {
  const agg = new Map<
    string,
    { goals: number; assists: number; mvp: number; matchIds: Set<string> }
  >();

  for (const p of players) {
    agg.set(p.id, { goals: 0, assists: 0, mvp: 0, matchIds: new Set() });
  }

  const finished = matches.filter(
    (m) => m.status === "finished" && m.homeScore !== null && m.awayScore !== null,
  );

  for (const match of finished) {
    for (const s of match.scorers) {
      const row = agg.get(s.playerId);
      if (row) {
        row.goals += 1;
        row.matchIds.add(match.id);
      }
    }
    for (const a of match.assists) {
      const row = agg.get(a.playerId);
      if (row) {
        row.assists += 1;
        row.matchIds.add(match.id);
      }
    }
    if (match.mvpPlayerId) {
      const row = agg.get(match.mvpPlayerId);
      if (row) {
        row.mvp += 1;
        row.matchIds.add(match.id);
      }
    }
  }

  return players.map((p) => {
    const row = agg.get(p.id)!;
    return {
      ...p,
      goals: row.goals,
      assists: row.assists,
      mvpAwards: row.mvp,
      matchesPlayed: row.matchIds.size,
    };
  });
}

export function countTeamGoals(
  events: { playerId: string }[],
  squadIds: Set<string>,
): number {
  return events.filter((e) => squadIds.has(e.playerId)).length;
}

export function validateMatchGoals(
  data: AppData,
  match: Pick<Match, "homeClubId" | "awayClubId" | "homeScore" | "awayScore" | "scorers">,
): string | null {
  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const homeSquad = new Set(
    data.players.filter((p) => p.clubId === match.homeClubId).map((p) => p.id),
  );
  const awaySquad = new Set(
    data.players.filter((p) => p.clubId === match.awayClubId).map((p) => p.id),
  );
  const homeGoals = countTeamGoals(match.scorers, homeSquad);
  const awayGoals = countTeamGoals(match.scorers, awaySquad);

  if (homeGoals !== homeScore || awayGoals !== awayScore) {
    return `Goles registrados (${homeGoals}-${awayGoals}) no coinciden con el marcador (${homeScore}-${awayScore}). Ajusta goleadores o marcador.`;
  }
  return null;
}
