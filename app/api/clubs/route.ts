import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { mapClub } from "@/lib/db/mappers";

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();
    const { name, crestColor, logoUrl } = body as {
      name?: string;
      crestColor?: string;
      logoUrl?: string;
    };

    if (!name?.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
    }

    const tag = name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3) || "CLB";

    const club = await prisma.club.create({
      data: {
        name: name.trim(),
        tag,
        crestColor: crestColor ?? "#7c3aed",
        logoUrl: logoUrl ?? null,
        founderId: user.id,
      },
    });

    if (user.playerId && user.role !== "admin") {
      await prisma.player.update({
        where: { id: user.playerId },
        data: { clubId: club.id },
      });
    }

    return NextResponse.json({ club: mapClub(club) });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al crear el club." }, { status: 500 });
  }
}
