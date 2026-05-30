"use client";

import { FormEvent, useState } from "react";
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
  const { user, captainClubId } = useAuth();
  const data = useAppData();
  const { refresh } = useData();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const club = captainClubId ? getClub(data, captainClubId) : undefined;
  const displayLogo = logoUrl ?? club?.logoUrl ?? null;

  if (!user) return null;

  if (!captainClubId || !club) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-400">
          No eres capitán de ningún equipo. Un administrador debe asignarte como
          capitán desde la gestión de clubes.
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

  return (
    <div>
      <PageHeader
        title="Mi equipo"
        description={`Capitán de ${club.name} — personaliza el escudo y gestiona solicitudes.`}
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
      </div>

      <p className="mt-6 text-sm text-zinc-500">
        <Link href={`/clubes/${club.id}`} className="text-violet-400 hover:underline">
          Ver página pública del club →
        </Link>
      </p>
    </div>
  );
}
