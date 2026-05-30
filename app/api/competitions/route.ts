import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { mapCompetition } from "@/lib/db/mappers";
import {
  DEFAULT_COMPETITION_CONFIG,
  parseCompetitionConfig,
  resolveCompetitionType,
  serializeCompetitionConfig,
  type CompetitionConfig,
} from "@/lib/types/competition-config";
import type { CompetitionType } from "@/lib/types";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const {
      name,
      description,
      clubIds,
      calendarMode = "auto",
      config: rawConfig,
    } = body as {
      name?: string;
      description?: string;
      clubIds?: string[];
      calendarMode?: "manual" | "auto";
      config?: Partial<CompetitionConfig>;
    };

    const config: CompetitionConfig = {
      ...DEFAULT_COMPETITION_CONFIG,
      ...rawConfig,
      calendarMode,
      phases: rawConfig?.phases?.length
        ? rawConfig.phases
        : DEFAULT_COMPETITION_CONFIG.phases,
    };

    if (!config.phases?.length) {
      return NextResponse.json({ error: "Añade al menos una fase." }, { status: 400 });
    }

    const type: CompetitionType = resolveCompetitionType(config);
    const season = new Date().getFullYear().toString();
    const compName =
      name?.trim() ||
      `${config.phases[0]?.name ?? "Competición"} ${season}`;

    const comp = await prisma.competition.create({
      data: {
        name: compName,
        type,
        season,
        status: "active",
        description: description ?? "",
        calendarMode,
        configJson: serializeCompetitionConfig(config),
        clubs: clubIds?.length
          ? { create: clubIds.map((clubId) => ({ clubId })) }
          : undefined,
      },
      include: { clubs: true },
    });

    return NextResponse.json({ competition: mapCompetition(comp) });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al crear competición." }, { status: 500 });
  }
}
