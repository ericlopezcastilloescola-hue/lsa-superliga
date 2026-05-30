import { NextResponse } from "next/server";
import { requireAdmin, loadSessionUserFromDb } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      include: {
        player: {
          include: { club: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
        player: u.player
          ? {
              id: u.player.id,
              name: u.player.name,
              gamertag: u.player.gamertag,
              clubName: u.player.club?.name ?? null,
            }
          : null,
      })),
    });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al cargar usuarios." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { userId, role } = body as { userId?: string; role?: string };

    if (!userId || !role) {
      return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
    }

    if (!["user", "captain", "admin"].includes(role)) {
      return NextResponse.json({ error: "Rol no válido." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      include: { player: true },
    });

    const sessionUser = await loadSessionUserFromDb(user.id);

    return NextResponse.json({
      user: sessionUser ?? {
        id: user.id,
        email: user.email,
        role: user.role,
        playerId: user.player?.id ?? null,
        captainClubId: null,
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al actualizar rol." }, { status: 500 });
  }
}
