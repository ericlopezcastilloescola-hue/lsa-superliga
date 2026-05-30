import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { player: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    if (user.role === "admin") {
      return NextResponse.json(
        { error: "No se puede eliminar una cuenta admin." },
        { status: 403 },
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      ok: true,
      deleted: user.player?.gamertag ?? user.email,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al eliminar usuario." }, { status: 500 });
  }
}
