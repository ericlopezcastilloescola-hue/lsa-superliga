import { NextResponse } from "next/server";
import { canManageClubDb } from "@/lib/auth/club-access";
import { requireSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSessionUser();
    const { id: clubId } = await params;

    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) {
      return NextResponse.json({ error: "Club no encontrado." }, { status: 404 });
    }

    if (!session.playerId) {
      return NextResponse.json({ error: "Necesitas un perfil de jugador." }, { status: 400 });
    }

    const player = await prisma.player.findUnique({ where: { id: session.playerId } });
    if (player?.clubId === clubId) {
      return NextResponse.json({ error: "Ya perteneces a este equipo." }, { status: 400 });
    }
    if (player?.clubId) {
      return NextResponse.json(
        { error: "Debes abandonar tu equipo actual antes de solicitar otro." },
        { status: 400 },
      );
    }

    const existing = await prisma.joinRequest.findUnique({
      where: { clubId_userId: { clubId, userId: session.id } },
    });
    if (existing?.status === "pending") {
      return NextResponse.json({ error: "Ya tienes una solicitud pendiente." }, { status: 409 });
    }

    const jr = await prisma.joinRequest.upsert({
      where: { clubId_userId: { clubId, userId: session.id } },
      create: { clubId, userId: session.id, status: "pending" },
      update: { status: "pending", createdAt: new Date() },
    });

    return NextResponse.json({ joinRequest: jr });
  } catch {
    return NextResponse.json({ error: "Error al enviar solicitud." }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSessionUser();
    const { id: clubId } = await params;

    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) {
      return NextResponse.json({ error: "Club no encontrado." }, { status: 404 });
    }

    if (!(await canManageClubDb(session.id, clubId, session.role === "admin"))) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const requests = await prisma.joinRequest.findMany({
      where: { clubId, status: "pending" },
      include: { user: { include: { player: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id,
        userId: r.userId,
        email: r.user.email,
        gamertag: r.user.player?.gamertag,
        name: r.user.player?.name,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Error al cargar solicitudes." }, { status: 403 });
  }
}
