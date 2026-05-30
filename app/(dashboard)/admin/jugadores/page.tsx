"use client";

import Link from "next/link";
import { ClubCrest } from "@/components/clubs/club-crest";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { useAppData } from "@/lib/store/data-context";
import { POSICION } from "@/lib/i18n/es";
import { getClub } from "@/lib/utils/stats";

export default function AdminJugadoresPage() {
  const data = useAppData();

  return (
    <div>
      <PageHeader
        title="Todos los jugadores"
        description="Listado completo de usuarios/jugadores registrados (solo administradores)."
      />

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-[#12151c] text-left text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-5 py-3">Jugador</th>
              <th className="px-5 py-3">Posición</th>
              <th className="px-5 py-3">Club</th>
              <th className="px-5 py-3 text-center">G</th>
              <th className="px-5 py-3 text-center">A</th>
              <th className="px-5 py-3 text-center">MVP</th>
            </tr>
          </thead>
          <tbody>
            {data.players.map((p) => {
              const club = p.clubId ? getClub(data, p.clubId) : null;
              return (
                <tr
                  key={p.id}
                  className="border-t border-white/5 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/jugadores/${p.id}`}
                      className="font-medium hover:text-cyan-400"
                    >
                      {p.gamertag}
                    </Link>
                    <p className="text-xs text-zinc-500">{p.name}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge color="zinc">{POSICION[p.position]}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    {club ? (
                      <Link href={`/clubes/${club.id}`} className="flex items-center gap-2">
                        <ClubCrest club={club} size="sm" />
                        {club.name}
                      </Link>
                    ) : (
                      <Badge color="pink">Libre</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center font-mono">{p.goals}</td>
                  <td className="px-5 py-3 text-center font-mono">{p.assists}</td>
                  <td className="px-5 py-3 text-center font-mono">{p.mvpAwards}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.players.length === 0 && (
        <Card className="mt-4">
          <CardBody className="py-8 text-center text-zinc-500">
            No hay jugadores registrados.
          </CardBody>
        </Card>
      )}
    </div>
  );
}
