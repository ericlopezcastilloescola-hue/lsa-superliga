import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { mapPlayer } from "@/lib/db/mappers";
import { isValidImageRef } from "@/lib/uploads/save-image";

export async function GET() {
  try {
    const session = await requireSessionUser();
    if (!session.playerId) {
      return NextResponse.json({ error: "Sin perfil de jugador." }, { status: 404 });
    }

    const player = await prisma.player.findUnique({
      where: { id: session.playerId },
    });
    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ player: mapPlayer(player) });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al cargar perfil." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session.playerId) {
      return NextResponse.json({ error: "Sin perfil de jugador." }, { status: 404 });
    }

    const body = await request.json();
    const { name, avatarUrl, nationality, number } = body as {
      name?: string;
      avatarUrl?: string | null;
      nationality?: string;
      number?: number;
    };

    if (avatarUrl !== undefined && avatarUrl !== null && avatarUrl !== "") {
      if (!isValidImageRef(avatarUrl.trim())) {
        return NextResponse.json(
          { error: "La imagen no es válida." },
          { status: 400 },
        );
      }
    }

    const player = await prisma.player.update({
      where: { id: session.playerId },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(avatarUrl !== undefined
          ? { avatarUrl: avatarUrl?.trim() || null }
          : {}),
        ...(nationality !== undefined ? { nationality: nationality.trim() } : {}),
        ...(number !== undefined ? { number } : {}),
      },
    });

    return NextResponse.json({ player: mapPlayer(player) });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al guardar perfil." }, { status: 500 });
  }
}
