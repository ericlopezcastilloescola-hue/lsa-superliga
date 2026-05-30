"use client";

import { useParams } from "next/navigation";
import { CompetitionCalendarActions } from "@/components/competitions/competition-calendar-actions";
import { GenerateCalendarButton } from "@/components/competitions/generate-calendar-button";
import { KnockoutBracketView } from "@/components/competitions/knockout-bracket-view";
import { CompetitionNav } from "@/components/competitions/competition-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { useAppData } from "@/lib/store/data-context";
import { getCompetition } from "@/lib/utils/stats";

export default function EliminatoriasPage() {
  const { id } = useParams<{ id: string }>();
  const data = useAppData();
  const comp = getCompetition(data, id);
  const rounds = data.knockoutRounds.filter((kr) => kr.competitionId === id);

  if (!comp) return null;

  const hasTwoLegSeries = comp.config?.phases?.some(
    (p) => p.type === "llaves" && (p.matchesPerSeries ?? 1) >= 2,
  );

  return (
    <div>
      <PageHeader
        title={`Eliminatorias — ${comp.name}`}
        description={
          hasTwoLegSeries
            ? "Cuadro eliminatorio a ida y vuelta. El marcador global decide la serie."
            : "Cuadro eliminatorio. Los ganadores avanzan al guardar resultados."
        }
      />

      <CompetitionNav comp={comp} id={id} />

      <div className="mb-6">
        <CompetitionCalendarActions comp={comp} />
      </div>

      {rounds.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-6 py-12 text-center">
            <p className="text-sm text-zinc-500">
              No hay rondas eliminatorias. Inscribe al menos 2 equipos y genera el
              calendario.
            </p>
            <GenerateCalendarButton comp={comp} size="large" />
          </CardBody>
        </Card>
      ) : (
        <>
          {hasTwoLegSeries && (
            <p className="mb-4 text-xs text-zinc-500">
              Cada serie muestra ida y vuelta. Pulsa{" "}
              <strong className="text-zinc-400">Regenerar calendario</strong> si
              cambiaste partidos por serie después de crear la competición.
            </p>
          )}
          <KnockoutBracketView data={data} competitionId={id} />
        </>
      )}
    </div>
  );
}
