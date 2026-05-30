"use client";

import Link from "next/link";
import { LeagueLanding } from "@/components/home/league-landing";
import { MatchCard } from "@/components/matches/match-card";
import { StandingsTable } from "@/components/standings/standings-table";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/store/data-context";
import { useAuth } from "@/lib/store/auth-context";
import { computeStandings, getUpcomingMatches } from "@/lib/utils/stats";

export default function HomePage() {
  const data = useAppData();
  const { isAdmin } = useAuth();
  const mainLiga = data.competitions.find((c) => c.type === "liga" && c.status === "active");
  const standings = mainLiga ? computeStandings(data, mainLiga.id) : [];
  const upcoming = getUpcomingMatches(data, 4);

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 sm:space-y-6">
      <LeagueLanding isAdmin={isAdmin} />

      <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Card className="min-w-0 lg:col-span-2" glow>
          <CardHeader
            title="Clasificación"
            subtitle={mainLiga ? mainLiga.name : "Sin liga activa"}
            action={
              mainLiga ? (
                <Link
                  href={`/competiciones/${mainLiga.id}`}
                  className="whitespace-nowrap text-xs text-violet-400 hover:underline"
                >
                  Ver →
                </Link>
              ) : (
                <Link
                  href="/competiciones"
                  className="whitespace-nowrap text-xs text-violet-400 hover:underline"
                >
                  Ver →
                </Link>
              )
            }
          />
          <CardBody>
            {standings.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Aún no hay clasificación publicada.
              </p>
            ) : (
              <StandingsTable rows={standings} data={data} compact />
            )}
          </CardBody>
        </Card>

        <Card className="min-w-0" glow>
          <CardHeader title="Próximos partidos" />
          <CardBody className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-zinc-500">No hay partidos programados.</p>
            ) : (
              upcoming.map((m) => <MatchCard key={m.id} match={m} data={data} />)
            )}
            <Button href="/partidos" variant="ghost" className="w-full">
              Ver partidos
            </Button>
          </CardBody>
        </Card>

        <Card className="min-w-0 lg:col-span-2" glow>
          <CardHeader
            title="Rankings individuales"
            subtitle="Goleadores y asistentes"
            action={
              <Link
                href="/estadisticas"
                className="whitespace-nowrap text-xs text-violet-400 hover:underline"
              >
                Ver estadísticas →
              </Link>
            }
          />
          <CardBody>
            <p className="text-sm text-zinc-500">
              Consulta el máximo goleador, el rey de las asistencias y el ranking
              completo de la liga.
            </p>
            <Button href="/estadisticas" className="mt-4">
              Ir a estadísticas
            </Button>
          </CardBody>
        </Card>

        <Card className="min-w-0">
          <CardHeader
            title="Competiciones"
            action={
              <Link
                href="/competiciones"
                className="whitespace-nowrap text-xs text-violet-400 hover:underline"
              >
                Ver todas
              </Link>
            }
          />
          <CardBody className="space-y-2 sm:space-y-3">
            {data.competitions.length === 0 ? (
              <p className="text-sm text-zinc-500">No hay competiciones activas.</p>
            ) : (
              data.competitions.map((c) => (
                <Link
                  key={c.id}
                  href={`/competiciones/${c.id}`}
                  className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-white/5 px-3 py-2.5 transition-colors hover:border-violet-500/30 sm:px-4 sm:py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="text-xs text-zinc-500">{c.season}</p>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase text-violet-400 sm:text-xs">
                    {c.type}
                  </span>
                </Link>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
