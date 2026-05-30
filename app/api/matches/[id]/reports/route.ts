import { NextResponse } from "next/server";
import { canManageClubDb } from "@/lib/auth/club-access";
import { requireSessionUser } from "@/lib/auth/session";
import { isTbdClubId } from "@/lib/constants/tbd-club";
import { mapMatchReport } from "@/lib/db/mappers";
import { upsertMatchReport } from "@/lib/db/match-reports";
import { prisma } from "@/lib/db";
import type { MatchEvent } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSessionUser();
    const { id: matchId } = await params;
    const body = await request.json();

    const {
      clubId: requestedClubId,
      homeScore,
      awayScore,
      scorers = [],
      assists = [],
      mvpPlayerId = null,
    } = body as {
      clubId?: string;
      homeScore: number;
      awayScore: number;
      scorers?: MatchEvent[];
      assists?: MatchEvent[];
      mvpPlayerId?: string | null;
    };

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
    }

    if (
      !match.homeClubId ||
      !match.awayClubId ||
      isTbdClubId(match.homeClubId) ||
      isTbdClubId(match.awayClubId)
    ) {
      return NextResponse.json(
        { error: "Este partido aún no tiene equipos definidos." },
        { status: 400 },
      );
    }

    const isAdmin = session.role === "admin";
    const candidates = [match.homeClubId, match.awayClubId];
    const managed: string[] = [];
    for (const cid of candidates) {
      if (await canManageClubDb(session.id, cid, isAdmin)) {
        managed.push(cid);
      }
    }

    if (managed.length === 0) {
      return NextResponse.json(
        { error: "Solo capitanes del partido pueden reportar resultados." },
        { status: 403 },
      );
    }

    const clubId = requestedClubId ?? managed[0];
    if (!managed.includes(clubId)) {
      return NextResponse.json({ error: "No puedes reportar por ese equipo." }, { status: 403 });
    }

    const { report, autoApproved } = await upsertMatchReport({
      matchId,
      clubId,
      submittedById: session.id,
      payload: {
        homeScore,
        awayScore,
        scorers,
        assists,
        mvpPlayerId,
      },
    });

    return NextResponse.json({
      report: mapMatchReport(report),
      autoApproved,
    });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      if (e.message === "MATCH_ALREADY_FINISHED") {
        return NextResponse.json({ error: "El partido ya está finalizado." }, { status: 400 });
      }
      if (e.message === "INVALID_SCORE" || e.message.startsWith("Los jugadores")) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "Error al enviar informe." }, { status: 500 });
  }
}
