"use client";

import { useParams } from "next/navigation";
import { ClubCrest } from "@/components/clubs/club-crest";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useAppData } from "@/lib/store/data-context";
import { POSICION } from "@/lib/i18n/es";
import { getClub, getPlayer, getPlayerTransfers } from "@/lib/utils/stats";

export default function JugadorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const data = useAppData();
  const player = getPlayer(data, id);
  const visible = player && data.players.some((p) => p.id === id);

  if (!player || !visible) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-400">Jugador no encontrado.</p>
        <Button href="/jugadores" className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  const club = player.clubId ? getClub(data, player.clubId) : null;
  const transfers = getPlayerTransfers(data, id);

  return (
    <div>
      <PageHeader
        title={player.gamertag}
        description={player.name}
        action={
          <div className="flex items-center gap-3">
            {club && <ClubCrest club={club} />}
            <Badge color="cyan">{POSICION[player.position]}</Badge>
          </div>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-5">
        {[
          { label: "Goles", value: player.goals, color: "text-cyan-400" },
          { label: "Asistencias", value: player.assists, color: "text-violet-400" },
          { label: "MVP", value: player.mvpAwards, color: "text-rose-400" },
          { label: "Partidos", value: player.matchesPlayed, color: "text-white" },
          { label: "Media", value: player.rating.toFixed(1), color: "text-amber-400" },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody className="text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs uppercase text-zinc-500">{s.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Historial de traspasos" />
        <CardBody>
          {transfers.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin movimientos.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {transfers.map((t) => (
                <li key={t.id} className="rounded-lg border border-white/5 px-3 py-2">
                  {getClub(data, t.toClubId)?.name} · {t.date}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
