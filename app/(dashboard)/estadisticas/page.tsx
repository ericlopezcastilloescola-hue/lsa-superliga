"use client";

import Link from "next/link";
import { TopStatsTable } from "@/components/stats/top-stats-table";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useAppData } from "@/lib/store/data-context";
import {
  getGlobalTopAssists,
  getGlobalTopScorers,
} from "@/lib/utils/global-stats";
import { getClub } from "@/lib/utils/stats";

function TopPlayerHero({
  title,
  subtitle,
  row,
  data,
  valueLabel,
  accent,
}: {
  title: string;
  subtitle: string;
  row: ReturnType<typeof getGlobalTopScorers>[0] | undefined;
  data: ReturnType<typeof useAppData>;
  valueLabel: string;
  accent: "cyan" | "violet";
}) {
  if (!row) {
    return (
      <Card className="min-w-0">
        <CardBody className="py-10 text-center text-sm text-zinc-500">
          Aún no hay datos de {title.toLowerCase()}.
        </CardBody>
      </Card>
    );
  }

  const club = row.player.clubId ? getClub(data, row.player.clubId) : null;
  const glow =
    accent === "cyan"
      ? "from-cyan-500/20 via-transparent to-transparent border-cyan-500/30"
      : "from-violet-500/20 via-transparent to-transparent border-violet-500/30";

  return (
    <Link
      href={`/jugadores/${row.player.id}`}
      className={`block overflow-hidden rounded-2xl border bg-gradient-to-br ${glow} to-[#12151c] transition-all hover:scale-[1.01] hover:border-opacity-60`}
    >
      <div className="flex items-center gap-4 p-5 sm:p-6">
        <span className="text-3xl sm:text-4xl">🥇</span>
        <PlayerAvatar player={row.player} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            {subtitle}
          </p>
          <p className="truncate text-xl font-black text-white sm:text-2xl">
            {row.player.gamertag}
          </p>
          <p className="truncate text-sm text-zinc-500">
            {club?.name ?? "Sin club"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={`font-mono text-3xl font-black sm:text-4xl ${
              accent === "cyan" ? "text-cyan-400" : "text-violet-400"
            }`}
          >
            {row.value}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
            {valueLabel}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function EstadisticasPage() {
  const data = useAppData();
  const scorers = getGlobalTopScorers(data);
  const assists = getGlobalTopAssists(data);

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Estadísticas"
        description="Rankings globales de goleadores y asistentes de toda la liga."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <TopPlayerHero
          title="Goleador"
          subtitle="Máximo goleador"
          row={scorers[0]}
          data={data}
          valueLabel="Goles"
          accent="cyan"
        />
        <TopPlayerHero
          title="Asistente"
          subtitle="Máximo asistente"
          row={assists[0]}
          data={data}
          valueLabel="Asistencias"
          accent="violet"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <Card glow className="min-w-0">
          <CardHeader title="Goleadores" subtitle="Toda la liga" />
          <CardBody>
            <TopStatsTable
              rows={scorers}
              data={data}
              valueLabel="Goles"
              emptyMessage="No hay jugadores registrados."
              scrollable
            />
          </CardBody>
        </Card>

        <Card glow className="min-w-0">
          <CardHeader title="Asistencias" subtitle="Toda la liga" />
          <CardBody>
            <TopStatsTable
              rows={assists}
              data={data}
              valueLabel="Asist."
              emptyMessage="No hay jugadores registrados."
              scrollable
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
