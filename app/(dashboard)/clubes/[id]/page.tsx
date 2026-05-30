"use client";

import { useParams } from "next/navigation";
import { ClubJoinPanel } from "@/components/clubs/club-join-panel";
import { ClubCrest } from "@/components/clubs/club-crest";
import { ClubSquadPanel } from "@/components/clubs/club-squad-panel";
import { MatchCard } from "@/components/matches/match-card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useAppData, useData } from "@/lib/store/data-context";
import { useAuth } from "@/lib/store/auth-context";
import { useConfirm } from "@/lib/store/confirm-context";
import { getClub, getClubMatches } from "@/lib/utils/stats";

export default function ClubProfilePage() {
  const { id } = useParams<{ id: string }>();
  const data = useAppData();
  const { isAdmin } = useAuth();
  const { deleteClub } = useData();
  const { askConfirm } = useConfirm();
  const club = getClub(data, id);

  if (!club) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-400">Club no encontrado.</p>
        <Button href="/clubes" className="mt-4">
          Volver a clubes
        </Button>
      </div>
    );
  }

  const matches = getClubMatches(data, id).sort(
    (a, b) =>
      new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
  );
  const playerCount = data.players.filter((p) => p.clubId === id).length;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start">
        <ClubCrest club={club} size="lg" />
        <div className="flex-1">
          <PageHeader
            title={club.name}
            description={`${club.city || "Sin ciudad"} · Fundado ${club.founded}`}
            action={
              isAdmin ? (
                <Button
                  variant="danger"
                  onClick={async () => {
                    const ok = await askConfirm({
                      title: "Eliminar club",
                      message: `¿Eliminar ${club.name}? Los jugadores pasarán a agente libre.`,
                    });
                    if (ok) {
                      await deleteClub(id);
                      window.location.href = "/clubes";
                    }
                  }}
                >
                  Eliminar club
                </Button>
              ) : undefined
            }
          />
          <p className="max-w-2xl text-sm text-zinc-400">{club.description}</p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-violet-400">{playerCount}</p>
            <p className="text-xs uppercase text-zinc-500">Jugadores</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-white">{matches.length}</p>
            <p className="text-xs uppercase text-zinc-500">Partidos</p>
          </CardBody>
        </Card>
      </div>

      <div className="mb-6">
        <ClubJoinPanel clubId={id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ClubSquadPanel clubId={id} />

        <Card>
          <CardHeader title="Partidos del club" />
          <CardBody className="space-y-3">
            {matches.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin partidos aún.</p>
            ) : (
              matches.slice(0, 8).map((m) => (
                <MatchCard key={m.id} match={m} data={data} />
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
