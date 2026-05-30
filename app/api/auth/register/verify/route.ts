import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/auth/email";
import { loadSessionUserFromDb, setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body as { email?: string; code?: string };

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email y código son obligatorios." },
        { status: 400 },
      );
    }

    const normalizedEmail = normalizeEmail(email);
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email: normalizedEmail },
    });

    if (!pending) {
      return NextResponse.json(
        { error: "No hay registro pendiente. Solicita un nuevo código." },
        { status: 404 },
      );
    }

    if (pending.expiresAt < new Date()) {
      await prisma.pendingRegistration.delete({ where: { email: normalizedEmail } });
      return NextResponse.json(
        { error: "El código ha caducado. Solicita uno nuevo." },
        { status: 410 },
      );
    }

    if (pending.code !== code.trim()) {
      return NextResponse.json(
        { error: "Código incorrecto. Revisa tu correo e inténtalo de nuevo." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      await prisma.pendingRegistration.delete({ where: { email: normalizedEmail } });
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email." },
        { status: 409 },
      );
    }

    const isFirstUser = (await prisma.user.count()) === 0;

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: pending.passwordHash,
        emailVerified: true,
        role: isFirstUser ? "admin" : "user",
        player: {
          create: {
            name: pending.name,
            gamertag: pending.gamertag,
            position: "MID",
            nationality: "ES",
            number: 10,
            rating: 7.0,
          },
        },
      },
      include: { player: true },
    });

    await prisma.pendingRegistration.delete({ where: { email: normalizedEmail } });

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
      { error: "Error al verificar el código." },
      { status: 500 },
    );
  }
}
