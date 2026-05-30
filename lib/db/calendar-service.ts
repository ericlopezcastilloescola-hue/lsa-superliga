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

async function clearCompetitionCalendar(
  competitionId: string,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
) {
  await tx.match.deleteMany({ where: { competitionId } });
  await tx.matchday.deleteMany({ where: { competitionId } });
  await tx.knockoutRound.deleteMany({ where: { competitionId } });
  await tx.competition.update({
    where: { id: competitionId },
    data: { calendarGenerated: false },
  });
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

  try {
    await prisma.$transaction(
      async (tx) => {
        if (regenerate || existing.calendarGenerated) {
          await clearCompetitionCalendar(competitionId, tx);
        }

        await ensureTbdClub(tx);

        const createdMdIds: string[] = [];

        for (const md of calendar.matchdays) {
          const created = await tx.matchday.create({
            data: {
              competitionId,
              number: md.number,
              name: md.name,
              startDate: md.startDate,
            },
          });
          createdMdIds.push(created.id);
        }

        const createdMatchIds: string[] = [];

        for (const m of calendar.matches) {
          const homeClubId =
            m.homeClubId && m.homeClubId !== TBD_CLUB_ID ? m.homeClubId : TBD_CLUB_ID;
          const awayClubId =
            m.awayClubId && m.awayClubId !== TBD_CLUB_ID ? m.awayClubId : TBD_CLUB_ID;
          const created = await tx.match.create({
            data: {
              competitionId,
              matchdayId: createdMdIds[m.matchdayIndex] ?? null,
              homeClubId,
              awayClubId,
              scheduledAt: new Date(m.scheduledAt),
              round: m.round ?? null,
            },
          });
          createdMatchIds.push(created.id);
        }

        for (let i = 0; i < calendar.matches.length; i++) {
          const m = calendar.matches[i];
          if (m.feederMatchIndices) {
            const feederIds = m.feederMatchIndices
              .map((idx) => createdMatchIds[idx])
              .filter(Boolean);
            if (feederIds.length > 0) {
              await tx.match.update({
                where: { id: createdMatchIds[i] },
                data: { feederMatchIds: serializeStringArray(feederIds) },
              });
            }
          }
        }

        for (const kr of calendar.knockoutRounds) {
          const matchIds = kr.matchIndices
            .map((i) => createdMatchIds[i])
            .filter(Boolean);
          await tx.knockoutRound.create({
            data: {
              competitionId,
              name: kr.name,
              order: kr.order,
              matchIds: serializeStringArray(matchIds),
            },
          });
        }

        await tx.competition.update({
          where: { id: competitionId },
          data: { calendarGenerated: true },
        });
      },
      {
        maxWait: 15_000,
        timeout: 60_000,
      },
    );
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
