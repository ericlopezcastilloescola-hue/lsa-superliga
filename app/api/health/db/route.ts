import { NextResponse } from "next/server";
import { getTursoConfig } from "@/lib/db/turso-config";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const turso = getTursoConfig();
    const users = await prisma.user.count();
    return NextResponse.json({
      ok: true,
      tursoConfigured: Boolean(turso),
      users,
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
