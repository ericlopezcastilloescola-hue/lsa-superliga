import { NextResponse } from "next/server";
import { getTursoConfig } from "@/lib/db/turso-config";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const turso = getTursoConfig();
    const [users, players, clubs] = await Promise.all([
      prisma.user.count(),
      prisma.player.count(),
      prisma.club.count(),
    ]);
    return NextResponse.json({
      ok: true,
      tursoConfigured: Boolean(turso),
      users,
      players,
      clubs,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        tursoConfigured: Boolean(getTursoConfig()),
        error: e instanceof Error ? e.message : "Error de base de datos",
      },
      { status: 500 },
    );
  }
}
