import { NextResponse } from "next/server";
import { requireAdmin, requireSessionUser } from "@/lib/auth/session";
import { isClubCaptain } from "@/lib/auth/visibility";
import { prisma } from "@/lib/db";
import { mapClub } from "@/lib/db/mappers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSessionUser();
    const { id } = await params;
    const body = await request.json();

    const club = await prisma.club.findUnique({ where: { id } });
    if (!club) {
      return NextResponse.json({ error: "Club no encontrado." }, { status: 404 });
    }

    const isAdmin = session.role === "admin";
    const isCaptain = isClubCaptain(session.id, club.captainId, false);

    if (body.captainId !== undefined) {
      if (!isAdmin) {
        return NextResponse.json({ error: "Solo admin puede asignar capitán." }, { status: 403 });
      }
      const captainId = body.captainId || null;
      if (captainId) {
        const captainUser = await prisma.user.findUnique({ where: { id: captainId } });
        if (!captainUser) {
          return NextResponse.json({ error: "Usuario no encontrado." }, { status: 400 });
        }
      }
      const updated = await prisma.club.update({
        where: { id },
        data: { captainId },
      });
      return NextResponse.json({ club: mapClub(updated) });
    }

    if (isAdmin) {
      const updated = await prisma.club.update({
        where: { id },
        data: {
          name: body.name ?? club.name,
          tag: body.tag ?? club.tag,
          crestColor: body.crestColor ?? club.crestColor,
          logoUrl: body.logoUrl ?? club.logoUrl,
          city: body.city ?? club.city,
          description: body.description ?? club.description,
          founded: body.founded ?? club.founded,
        },
      });
      return NextResponse.json({ club: mapClub(updated) });
    }

    if (!isCaptain) {
      return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
    }

    const updated = await prisma.club.update({
      where: { id },
      data: {
        crestColor: body.crestColor ?? club.crestColor,
        logoUrl: body.logoUrl ?? club.logoUrl,
        tag: body.tag ?? club.tag,
      },
    });

    return NextResponse.json({ club: mapClub(updated) });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al actualizar." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.club.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al eliminar." }, { status: 500 });
  }
}
