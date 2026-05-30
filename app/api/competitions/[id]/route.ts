import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { tryGenerateCalendar } from "@/lib/db/calendar-service";
import { prisma } from "@/lib/db";
import { mapCompetition } from "@/lib/db/mappers";

export const maxDuration = 60;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    if (body.action === "addClub" && body.clubId) {
      await prisma.competitionClub.upsert({
        where: {
          competitionId_clubId: { competitionId: id, clubId: body.clubId },
        },
        create: { competitionId: id, clubId: body.clubId },
        update: {},
      });
    } else if (body.action === "removeClub" && body.clubId) {
      await prisma.competitionClub.deleteMany({
        where: { competitionId: id, clubId: body.clubId },
      });
    } else if (body.action === "generateCalendar") {
      const result = await tryGenerateCalendar(id, true);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        ok: true,
        engine: result.engine,
        matchCount: result.matchCount,
      });
    } else if (body.action === "createMatchday" || body.action === "addMatchday") {
      const count = await prisma.matchday.count({ where: { competitionId: id } });
      await prisma.matchday.create({
        data: {
          competitionId: id,
          number: count + 1,
          name: body.name ?? `Ronda ${count + 1}`,
          startDate: body.startDate ?? new Date().toISOString().slice(0, 10),
        },
      });
    } else if (body.action === "updateMatchday" && body.matchdayId) {
      const data: { name?: string; startDate?: string } = {};
      if (body.name) data.name = body.name;
      if (body.startDate) data.startDate = body.startDate;
      await prisma.matchday.update({
        where: { id: body.matchdayId },
        data,
      });
      if (body.applyDateToMatches && body.startDate) {
        const base = new Date(body.startDate);
        base.setHours(20, 0, 0, 0);
        await prisma.match.updateMany({
          where: { matchdayId: body.matchdayId },
          data: { scheduledAt: base },
        });
      }
    } else if (body.action === "deleteMatchday" && body.matchdayId) {
      await prisma.match.deleteMany({ where: { matchdayId: body.matchdayId } });
      await prisma.matchday.delete({ where: { id: body.matchdayId } });
      const remaining = await prisma.matchday.findMany({
        where: { competitionId: id },
        orderBy: { number: "asc" },
      });
      for (let i = 0; i < remaining.length; i++) {
        await prisma.matchday.update({
          where: { id: remaining[i].id },
          data: { number: i + 1 },
        });
      }
    } else if (body.action === "deleteMatchdayMatches" && body.matchdayId) {
      await prisma.match.deleteMany({ where: { matchdayId: body.matchdayId } });
    } else if (body.action === "deleteMatch" && body.matchId) {
      await prisma.match.delete({ where: { id: body.matchId } });
    } else if (body.action === "createMatch") {
      await prisma.match.create({
        data: {
          competitionId: id,
          matchdayId: body.matchdayId ?? null,
          homeClubId: body.homeClubId,
          awayClubId: body.awayClubId,
          scheduledAt: new Date(body.scheduledAt ?? Date.now()),
          round: body.round ?? null,
        },
      });
    } else if (body.action === "delete") {
      await prisma.competition.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    const updated = await prisma.competition.findUnique({
      where: { id },
      include: { clubs: true },
    });

    return NextResponse.json({
      competition: updated ? mapCompetition(updated) : null,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error en la operación." }, { status: 500 });
  }
}
