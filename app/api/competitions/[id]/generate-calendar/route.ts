import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import {
  CALENDAR_ENGINE,
  tryGenerateCalendar,
} from "@/lib/db/calendar-service";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const result = await tryGenerateCalendar(id, true);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      engine: result.engine,
      matchCount: result.matchCount,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json(
      {
        error: `Error al generar calendario (${CALENDAR_ENGINE}).`,
      },
      { status: 500 },
    );
  }
}
