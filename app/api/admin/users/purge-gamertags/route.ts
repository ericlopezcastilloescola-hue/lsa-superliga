import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { gamertags } = body as { gamertags?: string[] };

    if (!gamertags?.length) {
      return NextResponse.json({ error: "Indica al menos un gamertag." }, { status: 400 });
    }

    const deleted: string[] = [];
    const notFound: string[] = [];

    for (const tag of gamertags) {
      const player = await prisma.player.findUnique({
        where: { gamertag: tag.trim() },
        include: { user: true },
      });

      if (!player) {
        notFound.push(tag);
        continue;
      }

      if (player.user.role === "admin") {
        return NextResponse.json(
          { error: `No se puede eliminar al admin (${tag}).` },
          { status: 403 },
        );
      }

      await prisma.user.delete({ where: { id: player.userId } });
      deleted.push(tag);
    }

    return NextResponse.json({ ok: true, deleted, notFound });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al eliminar usuarios." }, { status: 500 });
  }
}
