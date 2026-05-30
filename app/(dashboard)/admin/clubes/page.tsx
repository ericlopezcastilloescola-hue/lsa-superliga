"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ClubCrest } from "@/components/clubs/club-crest";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { useAppData, useData } from "@/lib/store/data-context";
import { useConfirm } from "@/lib/store/confirm-context";

type AdminUserOption = {
  id: string;
  email: string;
  player: {
    gamertag: string;
    clubName: string | null;
  } | null;
};

export default function AdminClubesPage() {
  const data = useAppData();
  const { updateClub, deleteClub, refresh } = useData();
  const { askConfirm } = useConfirm();
  const [editing, setEditing] = useState<string | null>(null);
  const [assigningCaptain, setAssigningCaptain] = useState<string | null>(null);
  const [userOptions, setUserOptions] = useState<AdminUserOption[]>([]);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => (r.ok ? r.json() : { users: [] }))
      .then((body) => setUserOptions(body.users ?? []))
      .catch(() => setUserOptions([]));
  }, []);

  function handleUpdate(e: FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateClub(id, {
      name: String(fd.get("name")),
      city: String(fd.get("city")),
      description: String(fd.get("description")),
    });
    setEditing(null);
  }

  async function handleAssignCaptain(clubId: string, captainUserId: string) {
    const res = await fetch(`/api/clubs/${clubId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ captainId: captainUserId || null }),
    });
    if (res.ok) {
      await refresh();
      setAssigningCaptain(null);
    }
  }

  function captainLabel(userId: string | null) {
    if (!userId) return "Sin asignar";
    const user = userOptions.find((u) => u.id === userId);
    if (user?.player) {
      const clubNote = user.player.clubName ? ` · ${user.player.clubName}` : " · Libre";
      return `${user.player.gamertag}${clubNote}`;
    }
    const player = data.players.find((p) => p.userId === userId);
    if (player) {
      const club = player.clubId ? data.clubs.find((c) => c.id === player.clubId) : null;
      return club ? `${player.gamertag} · ${club.name}` : `${player.gamertag} · Libre`;
    }
    return user?.email ?? "Usuario";
  }

  const captainCandidates = userOptions.filter((u) => u.player);

  return (
    <div>
      <PageHeader
        title="Gestionar clubes"
        action={
          <div className="flex gap-2">
            <Button href="/clubes/nuevo">+ Nuevo equipo</Button>
            <Link href="/admin" className="self-center text-sm text-cyan-400 hover:underline">
              ← Admin
            </Link>
          </div>
        }
      />

      <div className="space-y-4">
        {data.clubs.map((club) => {
          const members = data.players.filter((p) => p.clubId === club.id);

          return (
            <Card key={club.id}>
              <CardBody>
                {editing === club.id ? (
                  <form
                    onSubmit={(e) => handleUpdate(e, club.id)}
                    className="space-y-3"
                  >
                    <Input name="name" defaultValue={club.name} label="Nombre" />
                    <Input name="city" defaultValue={club.city} label="Ciudad" />
                    <Textarea
                      name="description"
                      defaultValue={club.description}
                      label="Descripción"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button type="submit">Guardar</Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setEditing(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <ClubCrest club={club} />
                        <div>
                          <p className="font-bold">{club.name}</p>
                          <p className="text-sm text-zinc-500">{club.city}</p>
                          <p className="text-xs text-violet-400">
                            Capitán: {captainLabel(club.captainId)}
                          </p>
                          <p className="text-xs text-zinc-600">
                            {members.length} jugador{members.length === 1 ? "" : "es"} en plantilla
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            setAssigningCaptain(
                              assigningCaptain === club.id ? null : club.id,
                            )
                          }
                        >
                          Asignar capitán
                        </Button>
                        <Button variant="secondary" onClick={() => setEditing(club.id)}>
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={async () => {
                            const ok = await askConfirm({
                              title: "Eliminar equipo",
                              message: `¿Eliminar ${club.name}? Los jugadores pasarán a agente libre.`,
                            });
                            if (ok) deleteClub(club.id);
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>

                    {assigningCaptain === club.id && (
                      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                        <Select
                          label="Capitán del equipo"
                          defaultValue={club.captainId ?? ""}
                          onChange={(e) =>
                            handleAssignCaptain(club.id, e.target.value)
                          }
                        >
                          <option value="">Sin capitán</option>
                          {captainCandidates.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.player!.gamertag}
                              {u.player!.clubName
                                ? ` (${u.player!.clubName})`
                                : " (Libre)"}
                            </option>
                          ))}
                        </Select>
                        <p className="mt-2 text-xs text-zinc-500">
                          Puedes asignar cualquier usuario registrado, aunque no
                          esté en la plantilla. Tendrá acceso al panel &quot;Mi
                          equipo&quot; de este club.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
