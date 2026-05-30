"use client";

import { Card, CardBody } from "@/components/ui/card";
import type { Competition } from "@/lib/types";
import { useAuth } from "@/lib/store/auth-context";
import { GenerateCalendarButton } from "@/components/competitions/generate-calendar-button";

export function CompetitionCalendarActions({ comp }: { comp: Competition }) {
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return (
    <Card glow>
      <CardBody className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-white">Calendario de la competición</p>
          <p className="mt-1 text-sm text-zinc-400">
            {comp.calendarGenerated
              ? "Calendario ya generado."
              : "Aún no hay calendario — genera las rondas y partidos."}{" "}
            · {comp.clubIds.length} equipos inscritos
            {comp.config?.phases?.length ? (
              <> · {comp.config.phases.length} fase(s)</>
            ) : null}
          </p>
        </div>
        <GenerateCalendarButton comp={comp} className="shrink-0" />
      </CardBody>
    </Card>
  );
}
