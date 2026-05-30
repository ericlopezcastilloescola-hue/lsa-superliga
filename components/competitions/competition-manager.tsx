"use client";

import Link from "next/link";
import { isTbdClubId } from "@/lib/constants/tbd-club";
import { CompetitionCalendarActions } from "@/components/competitions/competition-calendar-actions";
import { CompetitionRoundCalendar } from "@/components/competitions/competition-round-calendar";
import { KnockoutBracketView } from "@/components/competitions/knockout-bracket-view";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { TIPO_COMPETICION } from "@/lib/i18n/es";
import type { Competition } from "@/lib/types";
import { useAppData, useData } from "@/lib/store/data-context";
import { useAuth } from "@/lib/store/auth-context";
import { useConfirm } from "@/lib/store/confirm-context";
import { getClub } from "@/lib/utils/stats";
import { hasKnockout, hasStandings } from "@/lib/utils/competition-calendar";

export function CompetitionManager({ comp }: { comp: Competition }) {
  const data = useAppData();
  const { isAdmin } = useAuth();
  const {
    addClubToCompetition,
    removeClubFromCompetition,
    deleteCompetition,
  } = useData();
  const { askConfirm } = useConfirm();

  const showTableView = hasStandings(comp.type, comp.config);
  const showKnockoutOnly =
    hasKnockout(comp.type, comp.config) && !showTableView;

  const clubsInComp = comp.clubIds
    .map((id) => getClub(data, id))
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <CompetitionCalendarActions comp={comp} />

      <Card>
        <CardHeader
          title="Equipos en la competición"
          subtitle={`Formato: ${TIPO_COMPETICION[comp.type]}`}
        />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {clubsInComp.map((club) => (
              <div
                key={club!.id}
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2"
              >
                <span className="text-sm">{club!.name}</span>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await askConfirm({
                        title: "Quitar equipo",
                        message: `¿Quitar a ${club!.name} de la competición?`,
                      });
                      if (ok) removeClubFromCompetition(comp.id, club!.id);
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Quitar
                  </button>
                )}
              </div>
            ))}
          </div>
          {isAdmin &&
            data.clubs
              .filter((c) => !comp.clubIds.includes(c.id) && !isTbdClubId(c.id))
              .length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.clubs
                  .filter((c) => !comp.clubIds.includes(c.id) && !isTbdClubId(c.id))
                  .map((c) => (
                    <Button
                      key={c.id}
                      variant="secondary"
                      onClick={() => addClubToCompetition(comp.id, c.id)}
                    >
                      + {c.name}
                    </Button>
                  ))}
              </div>
            )}
          {data.clubs.length === 0 && (
            <p className="text-sm text-zinc-500">
              <Link href="/clubes/nuevo" className="text-violet-400 hover:underline">
                Crea equipos
              </Link>{" "}
              antes de inscribirlos.
            </p>
          )}
        </CardBody>
      </Card>

      {showTableView && <CompetitionRoundCalendar comp={comp} />}

      {showKnockoutOnly && comp.calendarGenerated && (
        <>
          <CompetitionRoundCalendar comp={comp} hideStandings />
          <Card glow>
            <CardHeader title="Cuadro eliminatorio" />
            <CardBody>
              <KnockoutBracketView data={data} competitionId={comp.id} />
            </CardBody>
          </Card>
        </>
      )}

      {showKnockoutOnly && !comp.calendarGenerated && (
        <Card glow>
          <CardHeader title="Eliminatorias" />
          <CardBody className="py-8 text-center">
            <p className="text-sm text-zinc-500">
              Inscribe equipos y pulsa{" "}
              <strong className="text-zinc-300">Generar calendario</strong> para
              crear las series (ida y vuelta si lo configuraste).
            </p>
          </CardBody>
        </Card>
      )}

      {isAdmin && (
        <div className="flex justify-end">
          <Button
            variant="danger"
            onClick={async () => {
              const ok = await askConfirm({
                title: "Eliminar competición",
                message: `¿Eliminar la competición "${comp.name}" y todos sus partidos?`,
              });
              if (ok) {
                await deleteCompetition(comp.id);
                window.location.href = "/competiciones";
              }
            }}
          >
            Eliminar competición
          </Button>
        </div>
      )}
    </div>
  );
}
