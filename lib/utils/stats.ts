import type {
  AppData,
  Club,
  Competition,
  Match,
  Player,
  StandingRow,
} from "@/lib/types";

export function getClub(data: AppData, id: string | null | undefined): Club | undefined {
  if (!id) return undefined;
  return data.clubs.find((c) => c.id === id);
}

export function getPlayer(data: AppData, id: string): Player | undefined {
  return data.players.find((p) => p.id === id);
}

export function getCompetition(
  data: AppData,
  id: string,
): Competition | undefined {
  return data.competitions.find((c) => c.id === id);
}

export function computeStandings(
  data: AppData,
  competitionId: string,
  options?: { groupLabel?: string; clubIds?: string[] },
): StandingRow[] {
  const competition = getCompetition(data, competitionId);
  if (!competition) return [];

  const eligibleClubIds = options?.clubIds ?? competition.clubIds;

  const rows = new Map<string, StandingRow>();

  for (const clubId of eligibleClubIds) {
    rows.set(clubId, {
      clubId,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  const matches = data.matches.filter(
    (m) =>
      m.competitionId === competitionId &&
      m.status === "finished" &&
      m.homeScore !== null &&
      m.awayScore !== null &&
      (!options?.groupLabel || m.round === options.groupLabel),
  );

  for (const match of matches) {
    if (!match.homeClubId || !match.awayClubId) continue;
    const home = rows.get(match.homeClubId);
    const away = rows.get(match.awayClubId);
    if (!home || !away) continue;

    const hs = match.homeScore!;
    const as = match.awayScore!;

    home.played++;
    away.played++;
    home.goalsFor += hs;
    home.goalsAgainst += as;
    away.goalsFor += as;
    away.goalsAgainst += hs;

    if (hs > as) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (hs < as) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += 1;
      away.points += 1;
    }
  }

  return Array.from(rows.values())
    .map((r) => ({
      ...r,
      goalDifference: r.goalsFor - r.goalsAgainst,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
}

export function getTopScorers(data: AppData, limit = 5) {
  return [...data.players]
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, limit);
}

export function getTopAssists(data: AppData, limit = 5) {
  return [...data.players]
    .filter((p) => p.assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, limit);
}

export function getUpcomingMatches(data: AppData, limit = 5): Match[] {
  return [...data.matches]
    .filter((m) => m.status === "scheduled")
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )
    .slice(0, limit);
}

export function getClubPlayers(data: AppData, clubId: string): Player[] {
  return data.players.filter((p) => p.clubId === clubId);
}

export function getClubMatches(data: AppData, clubId: string): Match[] {
  return data.matches.filter(
    (m) => m.homeClubId === clubId || m.awayClubId === clubId,
  );
}

export function getPlayerTransfers(data: AppData, playerId: string) {
  return data.transfers.filter((t) => t.playerId === playerId);
}

export function getCompetitionMatches(
  data: AppData,
  competitionId: string,
): Match[] {
  return data.matches.filter((m) => m.competitionId === competitionId);
}

export function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function competitionLabel(type: Competition["type"]): string {
  const labels = {
    liga: "Liga",
    eliminatoria_directa: "Eliminatoria directa",
    ida_vuelta: "Ida y vuelta",
    grupos_eliminatoria: "Grupos + eliminatoria",
  } as const;
  return labels[type] ?? type;
}

export { ESTADO_PARTIDO, ESTADO_COMPETICION, POSICION } from "@/lib/i18n/es";
