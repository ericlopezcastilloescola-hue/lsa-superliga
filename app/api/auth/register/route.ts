import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/auth/email";
import { hashPassword } from "@/lib/auth/password";
import { loadSessionUserFromDb, setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, gamertag } = body as {
      email?: string;
      password?: string;
      name?: string;
      gamertag?: string;
    };

    if (!email || !password || !name || !gamertag) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 },
      );
    }

    const normalizedEmail = normalizeEmail(email);
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email." },
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

    const passwordHash = await hashPassword(password);
    const isFirstUser = (await prisma.user.count()) === 0;

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: isFirstUser ? "admin" : "user",
        player: {
          create: {
            name,
            gamertag: tag,
            position: "MID",
            nationality: "ES",
            number: 10,
            rating: 7.0,
          },
        },
      },
      include: { player: true },
    });

    const sessionUser = await loadSessionUserFromDb(user.id);
    if (!sessionUser) {
      return NextResponse.json({ error: "Error de sesión." }, { status: 500 });
    }

    await setSessionCookie(sessionUser);

    return NextResponse.json({ user: sessionUser });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email o gamertag ya registrado." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Error al registrar la cuenta." },
      { status: 500 },
    );
  }
}
