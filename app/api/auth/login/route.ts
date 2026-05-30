import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/auth/email";
import { verifyPassword } from "@/lib/auth/password";
import { loadSessionUserFromDb, setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios." },
        { status: 400 },
      );
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { player: true },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Credenciales incorrectas." },
        { status: 401 },
      );
    }

    const sessionUser = await loadSessionUserFromDb(user.id);
    if (!sessionUser) {
      return NextResponse.json({ error: "Error de sesión." }, { status: 500 });
    }

    await setSessionCookie(sessionUser);

    return NextResponse.json({ user: sessionUser });
  } catch {
    return NextResponse.json(
      { error: "Error al iniciar sesión." },
      { status: 500 },
    );
  }
}
