"use client";

import { useParams } from "next/navigation";
import { CompetitionManager } from "@/components/competitions/competition-manager";
import { CompetitionNav } from "@/components/competitions/competition-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ESTADO_COMPETICION, TIPO_COMPETICION } from "@/lib/i18n/es";
import { useAppData } from "@/lib/store/data-context";
import { competitionLabel, getCompetition } from "@/lib/utils/stats";

export default function CompeticionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const data = useAppData();
  const comp = getCompetition(data, id);

  if (!comp) {
    return (
      <div className="py-20 text-center text-zinc-400">
        Competición no encontrada.
        <Button href="/competiciones" className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">{comp.name}</h1>
            <p className="text-sm text-zinc-400">
              {competitionLabel(comp.type)} · {comp.season} · {TIPO_COMPETICION[comp.type]}
            </p>
          </div>
          <Badge color="cyan">{ESTADO_COMPETICION[comp.status]}</Badge>
        </div>
      </header>

      <CompetitionNav comp={comp} id={id} />

      <div id="calendario">
        <CompetitionManager comp={comp} />
      </div>
    </div>
  );
}
