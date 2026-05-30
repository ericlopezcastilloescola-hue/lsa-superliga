import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { applyMatchResult } from "@/lib/db/match-results";
import { mapMatch } from "@/lib/db/mappers";
import type { MatchEvent } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const {
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

    const updated = await applyMatchResult(id, {
      homeScore,
      awayScore,
      scorers,
      assists,
      mvpPlayerId,
    });

    return NextResponse.json({ match: mapMatch(updated) });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Solo admins pueden editar resultados." }, { status: 403 });
    }
    if (e instanceof Error) {
      if (e.message === "MATCH_NOT_FOUND") {
        return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
      }
      if (e.message === "TEAMS_NOT_DEFINED") {
        return NextResponse.json(
          {
            error:
              "Este partido aún no tiene equipos definidos. Juega antes las rondas previas.",
          },
          { status: 400 },
        );
      }
      if (e.message === "INVALID_SCORE") {
        return NextResponse.json({ error: "Marcador no válido." }, { status: 400 });
      }
      if (e.message.startsWith("Los jugadores")) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "Error al guardar resultado." }, { status: 500 });
  }
}
