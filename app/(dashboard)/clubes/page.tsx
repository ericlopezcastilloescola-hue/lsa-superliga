"use client";

import Link from "next/link";
import { ClubCrest } from "@/components/clubs/club-crest";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useAppData } from "@/lib/store/data-context";
import { useAuth } from "@/lib/store/auth-context";
import { getClubMatches, getClubPlayers } from "@/lib/utils/stats";

export default function ClubesPage() {
  const data = useAppData();
  const { isAdmin } = useAuth();

  return (
    <div>
      <PageHeader
        title="Clubes"
        description="Perfiles, escudos, estadísticas e historial de cada club de la Superliga."
        action={
          isAdmin ? (
            <Button href="/admin/clubes">Gestionar clubes</Button>
          ) : undefined
        }
      />

      {data.clubs.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-zinc-400">Aún no hay clubes registrados en la liga.</p>
          </CardBody>
        </Card>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.clubs.map((club) => {
          const players = getClubPlayers(data, club.id);
          const matches = getClubMatches(data, club.id);
          const finished = matches.filter((m) => m.status === "finished");
          const wins = finished.filter((m) => {
            const isHome = m.homeClubId === club.id;
            const hs = m.homeScore ?? 0;
            const as = m.awayScore ?? 0;
            return isHome ? hs > as : as > hs;
          }).length;

          return (
            <Link key={club.id} href={`/clubes/${club.id}`}>
              <Card className="h-full transition-all hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(0,240,255,0.08)]">
                <CardBody>
                  <div className="flex items-start gap-4">
                    <ClubCrest club={club} size="lg" />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold">{club.name}</h2>
                      <p className="text-sm text-zinc-500">{club.city}</p>
                      <p className="mt-2 line-clamp-2 text-xs text-zinc-400">
                        {club.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-cyan-400">{players.length}</p>
                      <p className="text-[10px] uppercase text-zinc-500">Jugadores</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{finished.length}</p>
                      <p className="text-[10px] uppercase text-zinc-500">Partidos</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-400">{wins}</p>
                      <p className="text-[10px] uppercase text-zinc-500">Victorias</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>
      )}
    </div>
  );
}
