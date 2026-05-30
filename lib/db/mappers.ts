import { parseCompetitionConfig } from "@/lib/types/competition-config";
import type {
  AppData,
  Club,
  Competition,
  JoinRequest,
  KnockoutRound,
  Match,
  MatchEvent,
  Matchday,
  Player,
  TransferRecord,
  MatchReport,
} from "@/lib/types";
import type {
  Club as DbClub,
  Competition as DbCompetition,
  KnockoutRound as DbKnockoutRound,
  Match as DbMatch,
  Matchday as DbMatchday,
  Player as DbPlayer,
  TransferRecord as DbTransfer,
  JoinRequest as DbJoinRequest,
  MatchReport as DbMatchReport,
} from "@prisma/client";

function parseEvents(json: string): MatchEvent[] {
  try {
    return JSON.parse(json) as MatchEvent[];
  } catch {
    return [];
  }
}

function parseStringArray(json: string): string[] {
  try {
    return JSON.parse(json) as string[];
  } catch {
    return [];
  }
}

export function mapClub(c: DbClub, coCaptainUserIds: string[] = []): Club {
  return {
    id: c.id,
    name: c.name,
    tag: c.tag,
    crestColor: c.crestColor,
    logoUrl: c.logoUrl ?? undefined,
    founderId: c.founderId,
    captainId: c.captainId,
    coCaptainUserIds,
    founded: c.founded,
    city: c.city,
    description: c.description,
    createdAt: c.createdAt.toISOString(),
  };
}

export function mapPlayer(p: DbPlayer): Player {
  return {
    id: p.id,
    userId: p.userId,
    name: p.name,
    gamertag: p.gamertag,
    avatarUrl: p.avatarUrl ?? undefined,
    position: p.position as Player["position"],
    nationality: p.nationality,
    clubId: p.clubId,
    number: p.number,
    rating: p.rating,
    goals: p.goals,
    assists: p.assists,
    mvpAwards: p.mvpAwards,
    matchesPlayed: p.matchesPlayed,
    createdAt: p.createdAt.toISOString(),
  };
}

export function mapCompetition(
  c: DbCompetition & { clubs?: { clubId: string }[] },
): Competition {
  return {
    id: c.id,
    name: c.name,
    type: c.type as Competition["type"],
    season: c.season,
    status: c.status as Competition["status"],
    description: c.description,
    clubIds: c.clubs?.map((cc) => cc.clubId) ?? [],
    createdAt: c.createdAt.toISOString(),
    calendarGenerated: c.calendarGenerated,
    calendarMode: c.calendarMode as Competition["calendarMode"],
    config: parseCompetitionConfig(c.configJson),
  };
}

export function mapJoinRequest(
  jr: DbJoinRequest & { user?: { email: string; player?: { gamertag: string } | null } },
): JoinRequest {
  return {
    id: jr.id,
    clubId: jr.clubId,
    userId: jr.userId,
    status: jr.status as JoinRequest["status"],
    createdAt: jr.createdAt.toISOString(),
    userEmail: jr.user?.email,
    userGamertag: jr.user?.player?.gamertag,
  };
}

export function mapMatchday(md: DbMatchday): Matchday {
  return {
    id: md.id,
    competitionId: md.competitionId,
    number: md.number,
    name: md.name,
    startDate: md.startDate,
  };
}

export function mapMatch(m: DbMatch): Match {
  return {
    id: m.id,
    competitionId: m.competitionId,
    matchdayId: m.matchdayId,
    homeClubId: m.homeClubId,
    awayClubId: m.awayClubId,
    scheduledAt: m.scheduledAt.toISOString(),
    status: m.status as Match["status"],
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    scorers: parseEvents(m.scorers),
    assists: parseEvents(m.assists),
    mvpPlayerId: m.mvpPlayerId,
    round: m.round ?? undefined,
    feederMatchIds: m.feederMatchIds
      ? parseStringArray(m.feederMatchIds)
      : undefined,
  };
}

export function mapKnockoutRound(kr: DbKnockoutRound): KnockoutRound {
  return {
    id: kr.id,
    competitionId: kr.competitionId,
    name: kr.name,
    order: kr.order,
    matchIds: parseStringArray(kr.matchIds),
  };
}

export function mapTransfer(t: DbTransfer): TransferRecord {
  return {
    id: t.id,
    playerId: t.playerId,
    fromClubId: t.fromClubId,
    toClubId: t.toClubId,
    date: t.date,
  };
}

export function serializeEvents(events: MatchEvent[]): string {
  return JSON.stringify(events);
}

export function serializeStringArray(ids: string[]): string {
  return JSON.stringify(ids);
}

export function mapMatchReport(
  r: DbMatchReport & {
    club?: { name: string };
    submittedBy?: { player?: { gamertag: string } | null };
  },
): MatchReport {
  return {
    id: r.id,
    matchId: r.matchId,
    clubId: r.clubId,
    submittedById: r.submittedById,
    homeScore: r.homeScore,
    awayScore: r.awayScore,
    scorers: parseEvents(r.scorers),
    assists: parseEvents(r.assists),
    mvpPlayerId: r.mvpPlayerId,
    status: r.status as MatchReport["status"],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    submitterGamertag: r.submittedBy?.player?.gamertag,
    clubName: r.club?.name,
  };
}

export function buildAppData(input: {
  clubs: DbClub[];
  coCaptains?: { clubId: string; userId: string }[];
  players: DbPlayer[];
  competitions: (DbCompetition & { clubs: { clubId: string }[] })[];
  matchdays: DbMatchday[];
  matches: DbMatch[];
  knockoutRounds: DbKnockoutRound[];
  transfers: DbTransfer[];
  joinRequests?: (DbJoinRequest & {
    user?: { email: string; player?: { gamertag: string } | null };
  })[];
  matchReports?: (DbMatchReport & {
    club?: { name: string };
    submittedBy?: { player?: { gamertag: string } | null };
  })[];
}): AppData {
  const coByClub = new Map<string, string[]>();
  for (const row of input.coCaptains ?? []) {
    const list = coByClub.get(row.clubId) ?? [];
    list.push(row.userId);
    coByClub.set(row.clubId, list);
  }

  return {
    clubs: input.clubs.map((c) => mapClub(c, coByClub.get(c.id) ?? [])),
    players: input.players.map(mapPlayer),
    competitions: input.competitions.map(mapCompetition),
    matchdays: input.matchdays.map(mapMatchday),
    matches: input.matches.map(mapMatch),
    knockoutRounds: input.knockoutRounds.map(mapKnockoutRound),
    transfers: input.transfers.map(mapTransfer),
    joinRequests: (input.joinRequests ?? []).map(mapJoinRequest),
    matchReports: (input.matchReports ?? []).map(mapMatchReport),
  };
}
