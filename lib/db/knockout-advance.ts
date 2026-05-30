import { prisma } from "@/lib/db";
import {
  getSeriesWinnerFromFinishedMatch,
  parseFeederMatchIds,
  resolveIdaMatchId,
} from "@/lib/utils/knockout-bracket";
import type { Match } from "@/lib/types";

function mapDbMatch(m: {
  id: string;
  competitionId: string;
  matchdayId: string | null;
  homeClubId: string | null;
  awayClubId: string | null;
  scheduledAt: Date;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  round: string | null;
  feederMatchIds: string | null;
}): Match {
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
    scorers: [],
    assists: [],
    mvpPlayerId: null,
    round: m.round ?? undefined,
    feederMatchIds: parseFeederMatchIds(m.feederMatchIds),
  };
}

/** Tras guardar un resultado, avanza el ganador a los partidos hijos del bracket. */
export async function advanceKnockoutWinner(finishedMatchId: string) {
  const finishedRow = await prisma.match.findUnique({
    where: { id: finishedMatchId },
  });
  if (
    !finishedRow ||
    finishedRow.status !== "finished" ||
    finishedRow.homeScore === null ||
    finishedRow.awayScore === null
  ) {
    return;
  }

  const allRows = await prisma.match.findMany({
    where: { competitionId: finishedRow.competitionId },
  });
  const allMatches = allRows.map(mapDbMatch);
  const finished = mapDbMatch(finishedRow);

  const winnerId = getSeriesWinnerFromFinishedMatch(finished, allMatches);
  if (!winnerId) return;

  const idaMatchId = resolveIdaMatchId(finished, allMatches);

  for (const row of allRows) {
    const feeders = parseFeederMatchIds(row.feederMatchIds);
    const idx = feeders.indexOf(idaMatchId);
    if (idx === -1) continue;

    const data =
      idx === 0
        ? { homeClubId: winnerId }
        : { awayClubId: winnerId };

    await prisma.match.update({ where: { id: row.id }, data });
  }
}
