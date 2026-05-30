import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { transferPlayerToClub } from "@/lib/db/transfers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSessionUser();
    const { id } = await params;
    const body = await request.json();
    const toClubId =
      body.toClubId === null || body.toClubId === ""
        ? null
        : String(body.toClubId);

    const isAdmin = session.role === "admin";
    const isSelf = session.playerId === id;

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
    }

    if (!isAdmin && toClubId !== null) {
      return NextResponse.json(
        { error: "Solo un administrador puede asignarte a un club." },
        { status: 403 },
      );
    }

    await transferPlayerToClub(id, toClubId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      if (e.message === "PLAYER_NOT_FOUND") {
        return NextResponse.json({ error: "Jugador no encontrado." }, { status: 404 });
      }
      if (e.message === "CLUB_NOT_FOUND") {
        return NextResponse.json({ error: "Club no encontrado." }, { status: 404 });
      }
      if (e.message === "SAME_CLUB") {
        return NextResponse.json(
          { error: "El jugador ya está en ese club." },
          { status: 400 },
        );
      }
    }
    return NextResponse.json({ error: "Error al procesar traspaso." }, { status: 500 });
  }
}
