import { NextResponse } from "next/server";
import { isClubCaptain } from "@/lib/auth/visibility";
import { requireSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSessionUser();
    const { id } = await params;
    const body = await request.json();
    const { action } = body as { action?: "accept" | "reject" };

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
    }

    const jr = await prisma.joinRequest.findUnique({
      where: { id },
      include: { user: { include: { player: true } }, club: true },
    });
    if (!jr || jr.status !== "pending") {
      return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
    }

    if (!isClubCaptain(session.id, jr.club.captainId, session.role === "admin")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    if (action === "reject") {
      await prisma.joinRequest.update({
        where: { id },
        data: { status: "rejected" },
      });
      return NextResponse.json({ ok: true });
    }

    if (!jr.user.player) {
      return NextResponse.json({ error: "El usuario no tiene jugador." }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const fromClubId = jr.user.player.clubId;

    await prisma.$transaction([
      prisma.player.update({
        where: { id: jr.user.player.id },
        data: { clubId: jr.clubId },
      }),
      prisma.transferRecord.create({
        data: {
          playerId: jr.user.player.id,
          fromClubId,
          toClubId: jr.clubId,
          date: today,
        },
      }),
      prisma.joinRequest.update({
        where: { id },
        data: { status: "approved" },
      }),
      prisma.joinRequest.updateMany({
        where: {
          userId: jr.userId,
          id: { not: id },
          status: "pending",
        },
        data: { status: "rejected" },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al procesar solicitud." }, { status: 500 });
  }
}
