import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import {
  validateMatchSquadPlayers,
  recalculateAllPlayerStats,
} from "@/lib/db/queries";
import { advanceKnockoutWinner } from "@/lib/db/knockout-advance";
import { isTbdClubId } from "@/lib/constants/tbd-club";
import { prisma } from "@/lib/db";
import { mapMatch, serializeEvents } from "@/lib/db/mappers";
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    let {
      homeScore,
      awayScore,
      scorers = [],
      assists = [],
      mvpPlayerId = null,
    } = body as {
      homeScore: number;
      awayScore: number;
      scorers?: MatchEvent[];
      assists?: MatchEvent[];
      mvpPlayerId?: string | null;
    };

    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
    }

    if (!match.homeClubId || !match.awayClubId || isTbdClubId(match.homeClubId) || isTbdClubId(match.awayClubId)) {
      return NextResponse.json(
        {
          error:
            "Este partido aún no tiene equipos definidos. Juega antes las rondas previas.",
        },
        { status: 400 },
      );
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

    if (homeScore < 0 || awayScore < 0 || Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
      return NextResponse.json({ error: "Marcador no válido." }, { status: 400 });
    }

    const squadIds = [
      ...scorers.map((s) => s.playerId),
      ...assists.map((a) => a.playerId),
      ...(mvpPlayerId ? [mvpPlayerId] : []),
    ];
    if (squadIds.length > 0) {
      const squadError = await validateMatchSquadPlayers(id, squadIds);
      if (squadError) {
        return NextResponse.json({ error: squadError }, { status: 400 });
      }
    }

    const updated = await prisma.match.update({
      where: { id },
      data: {
        homeScore,
        awayScore,
        scorers: serializeEvents(scorers),
        assists: serializeEvents(assists),
        mvpPlayerId,
        status: "finished",
      },
    });

    await advanceKnockoutWinner(id);
    await recalculateAllPlayerStats();

    return NextResponse.json({ match: mapMatch(updated) });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Solo admins pueden editar resultados." }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al guardar resultado." }, { status: 500 });
  }
}
