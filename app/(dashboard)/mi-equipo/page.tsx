"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ClubCrest } from "@/components/clubs/club-crest";
import { ClubJoinPanel } from "@/components/clubs/club-join-panel";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useAppData, useData } from "@/lib/store/data-context";
import { useAuth } from "@/lib/store/auth-context";
import { getClub } from "@/lib/utils/stats";

export default function MiEquipoPage() {
  const { user, managedClubIds, isPrimaryCaptain } = useAuth();
  const data = useAppData();
  const { refresh, addCoCaptain, removeCoCaptain } = useData();
  const [loading, setLoading] = useState(false);
  const [coLoading, setCoLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [selectedCoCaptain, setSelectedCoCaptain] = useState("");

  const clubId = managedClubIds[0] ?? null;
  const club = clubId ? getClub(data, clubId) : undefined;
  const displayLogo = logoUrl ?? club?.logoUrl ?? null;
  const isPrimary = clubId ? isPrimaryCaptain(clubId) : false;

  const roster = useMemo(
    () => data.players.filter((p) => p.clubId === clubId && p.userId),
    [data.players, clubId],
  );

  const coCaptains = useMemo(() => {
    if (!club) return [];
    return roster.filter(
      (p) =>
        p.userId &&
        club.coCaptainUserIds.includes(p.userId) &&
        p.userId !== club.captainId,
    );
  }, [club, roster]);

  const eligibleCoCaptains = useMemo(() => {
    if (!club) return [];
    return roster.filter(
      (p) =>
        p.userId &&
        p.userId !== club.captainId &&
        !club.coCaptainUserIds.includes(p.userId),
    );
  }, [club, roster]);

  if (!user) return null;

  if (!clubId || !club) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-400">
          No gestionas ningún equipo. Un administrador debe asignarte como
          capitán o co-capitán.
        </p>
        <Button href="/clubes" className="mt-4">
          Ver clubes
        </Button>
      </div>
    );
  }

  async function handleLogoUploaded(url: string) {
    setLogoUrl(url);
    setMessage("Logo del equipo actualizado.");
    await refresh();
  }

  async function handleCrestUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/clubs/${club!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crestColor: String(fd.get("crestColor")),
          tag: String(fd.get("tag")),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Error al guardar");
      setMessage("Escudo actualizado correctamente.");
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCoCaptain() {
    if (!selectedCoCaptain) return;
    setCoLoading(true);
    setMessage(null);
    try {
      await addCoCaptain(club!.id, selectedCoCaptain);
      setSelectedCoCaptain("");
      setMessage("Co-capitán asignado correctamente.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al asignar");
    } finally {
      setCoLoading(false);
    }
  }

  async function handleRemoveCoCaptain(userId: string) {
    setCoLoading(true);
    setMessage(null);
    try {
      await removeCoCaptain(club!.id, userId);
      setMessage("Co-capitán eliminado.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al quitar");
    } finally {
      setCoLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Mi equipo"
        description={`${isPrimary ? "Capitán" : "Co-capitán"} de ${club.name} — personaliza el escudo y gestiona la plantilla.`}
      />

      <div className="mb-8 flex items-center gap-6">
        <ClubCrest club={{ ...club, logoUrl: displayLogo ?? undefined }} size="lg" />
        <div>
          <h2 className="text-2xl font-bold text-white">{club.name}</h2>
          <p className="text-sm text-zinc-500">{club.city || "Sin ciudad"}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Personalizar escudo" subtitle="Logo, tag y color" />
          <CardBody className="space-y-6">
            <ImageUpload
              label="Logo del equipo"
              uploadUrl="/api/upload/club-logo"
              extraFields={{ clubId: club.id }}
              previewUrl={displayLogo}
              previewFallback={<ClubCrest club={club} size="lg" />}
              shape="rounded"
              onUploaded={handleLogoUploaded}
            />

            <form onSubmit={handleCrestUpdate} className="space-y-4">
              <Input
                label="Tag (3 letras)"
                name="tag"
                defaultValue={club.tag}
                maxLength={3}
              />
              <Input
                label="Color del escudo (si no hay logo)"
                name="crestColor"
                type="color"
                defaultValue={club.crestColor}
              />
              {message && (
                <p className="text-sm text-violet-300">{message}</p>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando…" : "Guardar tag y color"}
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Solicitudes de unión"
            subtitle="Acepta o rechaza jugadores que quieren unirse"
          />
          <CardBody>
            <ClubJoinPanel clubId={club.id} captainOnly />
          </CardBody>
        </Card>

        {isPrimary && (
          <Card className="lg:col-span-2">
            <CardHeader
              title="Co-capitanes"
              subtitle="Otorga permisos de capitán a jugadores de tu plantilla"
            />
            <CardBody className="space-y-4">
              {coCaptains.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No hay co-capitanes asignados.
                </p>
              ) : (
                <ul className="space-y-2">
                  {coCaptains.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="font-medium text-white">{p.gamertag}</span>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={coLoading}
                        onClick={() => p.userId && handleRemoveCoCaptain(p.userId)}
                      >
                        Quitar
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              {eligibleCoCaptains.length > 0 ? (
                <div className="flex flex-wrap items-end gap-3 border-t border-white/10 pt-4">
                  <div className="min-w-[200px] flex-1">
                    <label className="mb-1 block text-xs text-zinc-500">
                      Añadir co-capitán
                    </label>
                    <select
                      value={selectedCoCaptain}
                      onChange={(e) => setSelectedCoCaptain(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    >
                      <option value="">Selecciona jugador…</option>
                      {eligibleCoCaptains.map((p) => (
                        <option key={p.id} value={p.userId!}>
                          {p.gamertag}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    disabled={coLoading || !selectedCoCaptain}
                    onClick={handleAddCoCaptain}
                  >
                    {coLoading ? "Asignando…" : "Asignar co-capitán"}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  Todos los jugadores con cuenta ya son co-capitanes o no hay más
                  elegibles.
                </p>
              )}
            </CardBody>
          </Card>
        )}
      </div>

      <p className="mt-6 text-sm text-zinc-500">
        <Link href={`/clubes/${club.id}`} className="text-violet-400 hover:underline">
          Ver página pública del club →
        </Link>
      </p>
    </div>
  );
}
