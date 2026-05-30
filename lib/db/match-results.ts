import { advanceKnockoutWinner } from "@/lib/db/knockout-advance";
import { recalculateAllPlayerStats, validateMatchSquadPlayers } from "@/lib/db/queries";
import { isTbdClubId } from "@/lib/constants/tbd-club";
import { prisma } from "@/lib/db";
import { serializeEvents } from "@/lib/db/mappers";
import type { MatchEvent } from "@/lib/types";
import { countTeamGoals } from "@/lib/utils/player-stats";

async function scorerCountsByClub(
  scorers: MatchEvent[],
  homeClubId: string,
  awayClubId: string,
) {
  const players = await prisma.player.findMany({
    where: { id: { in: scorers.map((s) => s.playerId) } },
    select: { id: true, clubId: true },
  });
  const homeIds = new Set(
    players.filter((p) => p.clubId === homeClubId).map((p) => p.id),
  );
  const awayIds = new Set(
    players.filter((p) => p.clubId === awayClubId).map((p) => p.id),
  );
  return {
    home: countTeamGoals(scorers, homeIds),
    away: countTeamGoals(scorers, awayIds),
  };
}

export type MatchResultPayload = {
  homeScore: number;
  awayScore: number;
  scorers: MatchEvent[];
  assists: MatchEvent[];
  mvpPlayerId: string | null;
};

export async function applyMatchResult(
  matchId: string,
  payload: MatchResultPayload,
) {
  let { homeScore, awayScore, scorers, assists, mvpPlayerId } = payload;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    throw new Error("MATCH_NOT_FOUND");
  }

  if (
    !match.homeClubId ||
    !match.awayClubId ||
    isTbdClubId(match.homeClubId) ||
    isTbdClubId(match.awayClubId)
  ) {
    throw new Error("TEAMS_NOT_DEFINED");
  }

  scorers = scorers.filter((s) => s.playerId);
  assists = assists.filter((a) => a.playerId);

  if (scorers.length > 0) {
    const counts = await scorerCountsByClub(
      scorers,
      match.homeClubId,
      match.awayClubId,
    );
    homeScore = counts.home;
    awayScore = counts.away;
  }

  if (
    homeScore < 0 ||
    awayScore < 0 ||
    Number.isNaN(homeScore) ||
    Number.isNaN(awayScore)
  ) {
    throw new Error("INVALID_SCORE");
  }

  const squadIds = [
    ...scorers.map((s) => s.playerId),
    ...assists.map((a) => a.playerId),
    ...(mvpPlayerId ? [mvpPlayerId] : []),
  ];
  if (squadIds.length > 0) {
    const squadError = await validateMatchSquadPlayers(matchId, squadIds);
    if (squadError) {
      throw new Error(squadError);
    }
  }

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore,
      awayScore,
      scorers: serializeEvents(scorers),
      assists: serializeEvents(assists),
      mvpPlayerId,
      status: "finished",
    },
  });

  await advanceKnockoutWinner(matchId);
  await recalculateAllPlayerStats();

  return updated;
}
