import { NextResponse } from "next/server";
import { requireSessionUser, loadSessionUserFromDb, setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    const body = await request.json();
    const { name, gamertag } = body as { name?: string; gamertag?: string };

    if (!name?.trim() || !gamertag?.trim()) {
      return NextResponse.json(
        { error: "Nombre y gamertag son obligatorios." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { player: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    if (user.player) {
      return NextResponse.json(
        { error: "Ya tienes un perfil de jugador." },
        { status: 409 },
      );
    }

    const tag = gamertag.trim();
    const existingTag = await prisma.player.findUnique({ where: { gamertag: tag } });
    if (existingTag) {
      return NextResponse.json(
        { error: "Ese gamertag ya está en uso. Elige otro." },
        { status: 409 },
      );
    }

    await prisma.player.create({
      data: {
        userId: user.id,
        name: name.trim(),
        gamertag: tag,
        position: "MID",
        nationality: "ES",
        number: 10,
        rating: 7.0,
      },
    });

    const sessionUser = await loadSessionUserFromDb(user.id);
    if (!sessionUser) {
      return NextResponse.json({ error: "Error de sesión." }, { status: 500 });
    }

    await setSessionCookie(sessionUser);

    return NextResponse.json({ user: sessionUser });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Error al completar el registro." },
      { status: 500 },
    );
  }
}
