import { randomUUID } from "crypto";
import { TBD_CLUB_ID } from "@/lib/constants/tbd-club";
import { prisma } from "@/lib/db";
import { ensureTbdClub } from "@/lib/db/ensure-tbd-club";
import { serializeStringArray } from "@/lib/db/mappers";
import { parseCompetitionConfig } from "@/lib/types/competition-config";
import type { CompetitionType } from "@/lib/types";
import {
  generateCompetitionCalendar,
  validateCalendarConfig,
} from "@/lib/utils/competition-calendar";

async function createManyInChunks<T>(
  items: T[],
  insert: (chunk: T[]) => Promise<unknown>,
  chunkSize = 80,
) {
  for (let i = 0; i < items.length; i += chunkSize) {
    await insert(items.slice(i, i + chunkSize));
  }
}

async function clearCompetitionCalendar(competitionId: string) {
  await prisma.match.deleteMany({ where: { competitionId } });
  await prisma.matchday.deleteMany({ where: { competitionId } });
  await prisma.knockoutRound.deleteMany({ where: { competitionId } });
}

export type CalendarPersistResult =
  | { ok: true }
  | { ok: false; error: string };

export async function persistCompetitionCalendar(
  competitionId: string,
  type: CompetitionType,
  clubIds: string[],
  configJson: string,
  regenerate = false,
): Promise<CalendarPersistResult> {
  const existing = await prisma.competition.findUnique({
    where: { id: competitionId },
  });

  if (!existing) {
    return { ok: false, error: "Competición no encontrada." };
  }

  const sortedClubIds = [...clubIds].sort();

  if (sortedClubIds.length < 2) {
    return { ok: false, error: "Inscribe al menos 2 equipos." };
  }

  if (existing.calendarGenerated && !regenerate) {
    return { ok: false, error: "El calendario ya está generado." };
  }

  const config = parseCompetitionConfig(configJson);
  const validationError = validateCalendarConfig(sortedClubIds, config);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const calendar = generateCompetitionCalendar(
    competitionId,
    type,
    sortedClubIds,
    undefined,
    config,
  );

  if (calendar.matchdays.length === 0) {
    return {
      ok: false,
      error: "No se generaron rondas. Revisa las fases de la competición.",
    };
  }

  if (calendar.matches.length === 0) {
    return {
      ok: false,
      error: "No se generaron partidos. ¿Hay equipos suficientes en cada grupo?",
    };
  }

  for (const m of calendar.matches) {
    if (m.matchdayIndex < 0 || m.matchdayIndex >= calendar.matchdays.length) {
      return {
        ok: false,
        error: "Error interno al generar calendario (índice de ronda inválido).",
      };
    }
  }

  const matchdayIds = calendar.matchdays.map(() => randomUUID());
  const matchIds = calendar.matches.map(() => randomUUID());

  const matchdayRows = calendar.matchdays.map((md, i) => ({
    id: matchdayIds[i],
    competitionId,
    number: md.number,
    name: md.name,
    startDate: md.startDate,
  }));

  const matchRows = calendar.matches.map((m, i) => {
    const homeClubId =
      m.homeClubId && m.homeClubId !== TBD_CLUB_ID ? m.homeClubId : TBD_CLUB_ID;
    const awayClubId =
      m.awayClubId && m.awayClubId !== TBD_CLUB_ID ? m.awayClubId : TBD_CLUB_ID;

    const feederIds = m.feederMatchIndices
      ?.map((idx) => matchIds[idx])
      .filter(Boolean);

    return {
      id: matchIds[i],
      competitionId,
      matchdayId: matchdayIds[m.matchdayIndex] ?? null,
      homeClubId,
      awayClubId,
      scheduledAt: new Date(m.scheduledAt),
      round: m.round ?? null,
      feederMatchIds:
        feederIds && feederIds.length > 0
          ? serializeStringArray(feederIds)
          : null,
    };
  });

  const knockoutRows = calendar.knockoutRounds.map((kr) => ({
    id: randomUUID(),
    competitionId,
    name: kr.name,
    order: kr.order,
    matchIds: serializeStringArray(
      kr.matchIndices.map((idx) => matchIds[idx]).filter(Boolean),
    ),
  }));

  try {
    if (regenerate || existing.calendarGenerated) {
      await clearCompetitionCalendar(competitionId);
    }

    await ensureTbdClub(prisma);

    await createManyInChunks(matchdayRows, (chunk) =>
      prisma.matchday.createMany({ data: chunk }),
    );

    await createManyInChunks(matchRows, (chunk) =>
      prisma.match.createMany({ data: chunk }),
    );

    if (knockoutRows.length > 0) {
      await prisma.knockoutRound.createMany({ data: knockoutRows });
    }

    await prisma.competition.update({
      where: { id: competitionId },
      data: { calendarGenerated: true },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error de base de datos";
    return { ok: false, error: `No se pudo guardar el calendario: ${msg}` };
  }

  return { ok: true };
}

export async function tryGenerateCalendar(
  competitionId: string,
  force = false,
): Promise<CalendarPersistResult> {
  const comp = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: { clubs: true },
  });
  if (!comp) {
    return { ok: false, error: "Competición no encontrada." };
  }
  if (comp.calendarGenerated && !force) {
    return { ok: false, error: "El calendario ya está generado." };
  }

  const clubIds = comp.clubs.map((c) => c.clubId);
  return persistCompetitionCalendar(
    competitionId,
    comp.type as CompetitionType,
    clubIds,
    comp.configJson,
    force,
  );
}
