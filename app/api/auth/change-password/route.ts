import { NextResponse } from "next/server";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { requireSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    const body = await request.json();
    const { currentPassword, newPassword } = body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user?.passwordHash) {
      return NextResponse.json(
        {
          error: user?.googleId
            ? "Esta cuenta usa Google. No puedes cambiar la contraseña aquí."
            : "Contraseña actual incorrecta.",
        },
        { status: 401 },
      );
    }
    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      return NextResponse.json(
        { error: "Contraseña actual incorrecta." },
        { status: 401 },
      );
    }

    await prisma.user.update({
      where: { id: session.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al cambiar contraseña." }, { status: 500 });
  }
}
