"use client";

import Link from "next/link";
import { PlayerRow } from "@/components/players/player-row";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useAppData } from "@/lib/store/data-context";

export function ClubSquadPanel({ clubId }: { clubId: string }) {
  const data = useAppData();
  const players = data.players.filter((p) => p.clubId === clubId);

  return (
    <Card>
      <CardHeader title="Plantilla" subtitle="Jugadores registrados en la plataforma" />
      <CardBody className="space-y-4">
        {players.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No hay jugadores en este equipo. Los jugadores se unen al registrarse en
            la plataforma y al crear o unirse a un club.
          </p>
        ) : (
          <ul className="space-y-1">
            {players.map((p) => (
              <li key={p.id} className="rounded-lg hover:bg-white/[0.02]">
                <PlayerRow player={p} data={data} stat="rating" />
              </li>
            ))}
          </ul>
        )}

        <Link
          href={`/clubes/${clubId}`}
          className="block text-center text-xs text-zinc-500 hover:text-violet-400"
        >
          Ver equipo →
        </Link>
      </CardBody>
    </Card>
  );
}
