import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/auth/email";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import {
  generateVerificationCode,
  sendVerificationEmail,
} from "@/lib/email/send-verification";

const CODE_TTL_MS = 15 * 60 * 1000;

export const runtime = "nodejs";

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
    const tag = gamertag.trim();
    const trimmedName = name.trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email." },
        { status: 409 },
      );
    }

    const existingTag = await prisma.player.findUnique({ where: { gamertag: tag } });
    if (existingTag) {
      return NextResponse.json(
        { error: "Ese gamertag ya está en uso. Elige otro." },
        { status: 409 },
      );
    }

    const code = generateVerificationCode();
    const passwordHash = await hashPassword(password);
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    await prisma.pendingRegistration.upsert({
      where: { email: normalizedEmail },
      create: {
        email: normalizedEmail,
        passwordHash,
        name: trimmedName,
        gamertag: tag,
        code,
        expiresAt,
      },
      update: {
        passwordHash,
        name: trimmedName,
        gamertag: tag,
        code,
        expiresAt,
      },
    });

    const sent = await sendVerificationEmail(normalizedEmail, code);
    if (!sent.ok) {
      return NextResponse.json({ error: sent.error }, { status: 503 });
    }

    return NextResponse.json({
      ok: true,
      message: "Te hemos enviado un código de verificación a tu correo.",
      devCode: process.env.NODE_ENV === "development" ? code : undefined,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("PendingRegistration") || msg.includes("no such table")) {
      return NextResponse.json(
        {
          error:
            "Base de datos desactualizada. Ejecuta npm run db:push-turso o contacta al admin.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Error al enviar el código de verificación." },
      { status: 500 },
    );
  }
}
