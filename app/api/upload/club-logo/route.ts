import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { canManageClubDb } from "@/lib/auth/club-access";
import { prisma } from "@/lib/db";
import { mapClub } from "@/lib/db/mappers";
import {
  deleteUploadedImageIfLocal,
  saveUploadedImage,
} from "@/lib/uploads/save-image";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    const formData = await request.formData();
    const file = formData.get("file");
    const clubId = String(formData.get("clubId") ?? "");

    if (!clubId) {
      return NextResponse.json({ error: "Falta el club." }, { status: 400 });
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Selecciona una imagen." },
        { status: 400 },
      );
    }

    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) {
      return NextResponse.json({ error: "Club no encontrado." }, { status: 404 });
    }

    const isAdmin = session.role === "admin";
    const canManage = await canManageClubDb(session.id, clubId, isAdmin);
    if (!canManage) {
      return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
    }

    const url = await saveUploadedImage(file, "clubs", clubId);

    const updated = await prisma.club.update({
      where: { id: clubId },
      data: { logoUrl: url },
    });

    await deleteUploadedImageIfLocal(club.logoUrl);

    return NextResponse.json({ url, club: mapClub(updated) });
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
