"use client";

import Link from "next/link";
import { LeagueLogo } from "@/components/brand/league-logo";
import { MatchCard } from "@/components/matches/match-card";
import { TopStatsTable } from "@/components/stats/top-stats-table";
import { StandingsTable } from "@/components/standings/standings-table";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SITE_DOMAIN, SITE_URL } from "@/lib/config/site";
import { useAppData } from "@/lib/store/data-context";
import { useAuth } from "@/lib/store/auth-context";
import {
  getGlobalTopAssists,
  getGlobalTopScorers,
} from "@/lib/utils/global-stats";
import {
  computeStandings,
  getUpcomingMatches,
} from "@/lib/utils/stats";

export default function HomePage() {
  const data = useAppData();
  const { isAdmin } = useAuth();
  const mainLiga = data.competitions.find((c) => c.type === "liga" && c.status === "active");
  const standings = mainLiga ? computeStandings(data, mainLiga.id) : [];
  const scorers = getGlobalTopScorers(data);
  const assists = getGlobalTopAssists(data);
  const upcoming = getUpcomingMatches(data, 4);

  return (
    <div>
      <section className="relative mb-6 overflow-hidden rounded-xl border border-violet-500/25 bg-gradient-to-br from-[#12151c] via-[#0d1018] to-[#1a0a14] p-4 sm:mb-10 sm:rounded-2xl sm:p-8">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-violet-600/15 to-transparent" />
        <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 lg:block">
          <LeagueLogo size="hero" priority />
        </div>
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          <LeagueLogo size="lg" priority className="lg:hidden" />
          <div className="flex-1">
            <a
              href={SITE_URL}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-sm font-semibold text-violet-300 transition-colors hover:border-violet-400/50"
            >
              {SITE_DOMAIN}
            </a>
            <h1 className="mt-4 max-w-xl text-2xl font-black tracking-tight text-white sm:text-4xl">
              LSA Superliga
            </h1>
            <p className="mt-2 text-base text-zinc-400 sm:text-lg">Clubes Pro</p>
            <p className="mt-3 max-w-lg text-sm text-zinc-500">
              Consulta clasificaciones, calendarios, resultados y estadísticas de
              la liga.
            </p>

            {isAdmin ? (
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                <Button href="/admin" className="w-full sm:w-auto">Panel Admin</Button>
                <Button href="/admin/competiciones" variant="secondary" className="w-full sm:w-auto">
                  Nueva competición
                </Button>
                <Button href="/admin/clubes" variant="secondary" className="w-full sm:w-auto">
                  Gestionar clubes
                </Button>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
                <Button href="/competiciones" className="w-full sm:w-auto">Ver competiciones</Button>
                <Button href="/partidos" variant="secondary" className="w-full sm:w-auto">
                  Ver partidos
                </Button>
                <Button href="/clubes" variant="ghost" className="w-full sm:w-auto">
                  Explorar clubes
                </Button>
              </div>
            )}
          </div>
        </div>

        {!isAdmin && (
          <div className="relative z-10 mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
            {[
              { label: "Clubes", value: data.clubs.length, href: "/clubes" },
              {
                label: "Competiciones",
                value: data.competitions.length,
                href: "/competiciones",
              },
              { label: "Partidos", value: data.matches.length, href: "/partidos" },
            ].map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:border-violet-500/30 hover:bg-violet-500/5"
              >
                <p className="text-2xl font-black text-violet-300">{stat.value}</p>
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  {stat.label}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" glow>
          <CardHeader
            title="Clasificación"
            subtitle={mainLiga ? mainLiga.name : "Sin liga activa"}
            action={
              mainLiga ? (
                <Link
                  href={`/competiciones/${mainLiga.id}`}
                  className="text-xs text-violet-400 hover:underline"
                >
                  Ver competición →
                </Link>
              ) : (
                <Link
                  href="/competiciones"
                  className="text-xs text-violet-400 hover:underline"
                >
                  Ver competiciones
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

        <Card glow>
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

        <Card glow>
          <CardHeader
            title="Máximos goleadores"
            subtitle="Todos los jugadores · todas las competiciones"
          />
          <CardBody className="pt-2">
            <TopStatsTable
              rows={scorers}
              data={data}
              valueLabel="Goles"
              emptyMessage="No hay jugadores registrados."
              scrollable
            />
          </CardBody>
        </Card>

        <Card glow>
          <CardHeader
            title="Máximas asistencias"
            subtitle="Todos los jugadores · todas las competiciones"
          />
          <CardBody className="pt-2">
            <TopStatsTable
              rows={assists}
              data={data}
              valueLabel="Asist."
              emptyMessage="No hay jugadores registrados."
              scrollable
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Competiciones"
            action={
              <Link
                href="/competiciones"
                className="text-xs text-violet-400 hover:underline"
              >
                Ver todas
              </Link>
            }
          />
          <CardBody className="space-y-3">
            {data.competitions.length === 0 ? (
              <p className="text-sm text-zinc-500">No hay competiciones activas.</p>
            ) : (
              data.competitions.map((c) => (
                <Link
                  key={c.id}
                  href={`/competiciones/${c.id}`}
                  className="flex items-center justify-between rounded-lg border border-white/5 px-4 py-3 transition-colors hover:border-violet-500/30"
                >
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-zinc-500">{c.season}</p>
                  </div>
                  <span className="text-xs uppercase text-violet-400">{c.type}</span>
                </Link>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
