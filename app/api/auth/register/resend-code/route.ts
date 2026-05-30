import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/auth/email";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email/send-verification";

const CODE_TTL_MS = 15 * 60 * 1000;

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email) {
      return NextResponse.json({ error: "Email obligatorio." }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email: normalizedEmail },
    });

    if (!pending) {
      return NextResponse.json(
        { error: "No hay registro pendiente. Vuelve al formulario." },
        { status: 404 },
      );
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    await prisma.pendingRegistration.update({
      where: { email: normalizedEmail },
      data: { code, expiresAt },
    });

    const sent = await sendVerificationEmail(normalizedEmail, code);
    if (!sent.ok) {
      return NextResponse.json({ error: sent.error }, { status: 503 });
    }

    return NextResponse.json({
      ok: true,
      message: "Nuevo código enviado.",
      devCode: process.env.NODE_ENV === "development" ? code : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "Error al reenviar el código." },
      { status: 500 },
    );
  }
}
