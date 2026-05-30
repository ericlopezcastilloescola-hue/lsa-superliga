import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { mapPlayer } from "@/lib/db/mappers";
import {
  deleteUploadedImageIfLocal,
  saveUploadedImage,
} from "@/lib/uploads/save-image";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session.playerId) {
      return NextResponse.json(
        { error: "Sin perfil de jugador." },
        { status: 404 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Selecciona una imagen." },
        { status: 400 },
      );
    }

    const current = await prisma.player.findUnique({
      where: { id: session.playerId },
      select: { avatarUrl: true },
    });

    const url = await saveUploadedImage(file, "avatars", session.playerId);

    const player = await prisma.player.update({
      where: { id: session.playerId },
      data: { avatarUrl: url },
    });

    await deleteUploadedImageIfLocal(current?.avatarUrl);

    return NextResponse.json({ url, player: mapPlayer(player) });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al subir la imagen." }, { status: 500 });
  }
}
