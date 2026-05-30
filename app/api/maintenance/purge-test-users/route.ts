import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Usuarios de prueba a eliminar (solo estos gamertags). */
const TEST_GAMERTAGS = ["yyy5555", "Miguelin999", "Papa1010"] as const;

/**
 * Mantenimiento puntual: elimina cuentas de prueba por gamertag.
 * GET /api/maintenance/purge-test-users?key=...
 */
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  const expected =
    process.env.MAINTENANCE_KEY ??
    process.env.JWT_SECRET ??
    "purge-lsa-test-20260530";

  if (!expected || key !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const deleted: string[] = [];
  const notFound: string[] = [];

  for (const tag of TEST_GAMERTAGS) {
    const player = await prisma.player.findUnique({
      where: { gamertag: tag },
      include: { user: true },
    });

    if (!player) {
      notFound.push(tag);
      continue;
    }

    if (player.user.role === "admin") {
      return NextResponse.json(
        { error: `Refusing to delete admin account (${tag}).` },
        { status: 403 },
      );
    }

    await prisma.user.delete({ where: { id: player.userId } });
    deleted.push(tag);
  }

  const [users, players] = await Promise.all([
    prisma.user.count(),
    prisma.player.count(),
  ]);

  return NextResponse.json({
    ok: true,
    deleted,
    notFound,
    remaining: { users, players },
  });
}
