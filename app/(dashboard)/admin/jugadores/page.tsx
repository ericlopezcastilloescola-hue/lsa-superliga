"use client";

import { useState } from "react";
import Link from "next/link";
import { ClubCrest } from "@/components/clubs/club-crest";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { useAppData, useData } from "@/lib/store/data-context";
import { useConfirm } from "@/lib/store/confirm-context";
import { POSICION } from "@/lib/i18n/es";
import { getClub } from "@/lib/utils/stats";

export default function AdminJugadoresPage() {
  const data = useAppData();
  const { transferPlayer } = useData();
  const { askConfirm } = useConfirm();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectReset, setSelectReset] = useState<Record<string, number>>({});

  async function handleTransfer(
    playerId: string,
    gamertag: string,
    toClubId: string | null,
    clubName: string,
  ) {
    const message =
      toClubId === null
        ? `¿Dejar a ${gamertag} como agente libre?`
        : `¿Traspasar a ${gamertag} a ${clubName}?`;

    const ok = await askConfirm({
      title: "Confirmar traspaso",
      message,
    });
    if (!ok) {
      setSelectReset((v) => ({ ...v, [playerId]: (v[playerId] ?? 0) + 1 }));
      return;
    }

    setBusyId(playerId);
    setError(null);
    try {
      await transferPlayer(playerId, toClubId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error en traspaso");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Todos los jugadores"
        description="Gestiona traspasos entre clubes. Los administradores pueden mover a cualquier jugador."
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-[#12151c] text-left text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-5 py-3">Jugador</th>
              <th className="px-5 py-3">Posición</th>
              <th className="px-5 py-3">Club</th>
              <th className="px-5 py-3">Traspaso</th>
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
                  <td className="px-5 py-3">
                    <Select
                      key={`${p.id}-${p.clubId ?? "free"}-${selectReset[p.id] ?? 0}`}
                      label=""
                      defaultValue={p.clubId ?? ""}
                      disabled={busyId === p.id}
                      onChange={(e) => {
                        const value = e.target.value;
                        const toClubId = value === "" ? null : value;
                        const targetClub = toClubId
                          ? data.clubs.find((c) => c.id === toClubId)
                          : null;
                        handleTransfer(
                          p.id,
                          p.gamertag,
                          toClubId,
                          targetClub?.name ?? "agente libre",
                        );
                      }}
                      className="min-w-[10rem]"
                    >
                      <option value="">Agente libre</option>
                      {data.clubs.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
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
