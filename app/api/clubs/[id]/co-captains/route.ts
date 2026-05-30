import { NextResponse } from "next/server";
import { isPrimaryCaptainDb } from "@/lib/auth/club-access";
import { requireSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSessionUser();
    const { id: clubId } = await params;
    const body = await request.json();
    const userId = String(body.userId ?? "");

    if (!userId) {
      return NextResponse.json({ error: "Falta el usuario." }, { status: 400 });
    }

    const isPrimary = await isPrimaryCaptainDb(session.id, clubId);
    if (!isPrimary && session.role !== "admin") {
      return NextResponse.json(
        { error: "Solo el capitán principal puede nombrar co-capitanes." },
        { status: 403 },
      );
    }

    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) {
      return NextResponse.json({ error: "Club no encontrado." }, { status: 404 });
    }

    if (club.captainId === userId) {
      return NextResponse.json(
        { error: "El capitán principal ya tiene todos los permisos." },
        { status: 400 },
      );
    }

    const player = await prisma.player.findFirst({
      where: { userId, clubId },
    });
    if (!player) {
      return NextResponse.json(
        { error: "El jugador debe pertenecer a la plantilla del equipo." },
        { status: 400 },
      );
    }

    await prisma.clubCoCaptain.upsert({
      where: { clubId_userId: { clubId, userId } },
      create: {
        clubId,
        userId,
        assignedByUserId: session.id,
      },
      update: {
        assignedByUserId: session.id,
      },
    });

    if (session.role !== "admin") {
      await prisma.user.updateMany({
        where: { id: userId, role: "user" },
        data: { role: "captain" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al asignar co-capitán." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSessionUser();
    const { id: clubId } = await params;
    const body = await request.json();
    const userId = String(body.userId ?? "");

    if (!userId) {
      return NextResponse.json({ error: "Falta el usuario." }, { status: 400 });
    }

    const isPrimary = await isPrimaryCaptainDb(session.id, clubId);
    if (!isPrimary && session.role !== "admin") {
      return NextResponse.json(
        { error: "Solo el capitán principal puede quitar co-capitanes." },
        { status: 403 },
      );
    }

    await prisma.clubCoCaptain.deleteMany({
      where: { clubId, userId },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al quitar co-capitán." }, { status: 500 });
  }
}
