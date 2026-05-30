"use client";

import { FormEvent, useEffect, useState } from "react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardBody } from "@/components/ui/card";
import { useAppData, useData } from "@/lib/store/data-context";
import { useAuth } from "@/lib/store/auth-context";

export default function PerfilPage() {
  const { user, refresh: refreshAuth } = useAuth();
  const data = useAppData();
  const { refresh } = useData();
  const player = data.players.find((p) => p.id === user?.playerId);

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [nationality, setNationality] = useState("ES");
  const [number, setNumber] = useState("10");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (player) {
      setName(player.name);
      setAvatarUrl(player.avatarUrl ?? null);
      setNationality(player.nationality);
      setNumber(String(player.number));
    }
  }, [player]);

  async function handleAvatarUploaded(url: string) {
    setAvatarUrl(url);
    setMessage("Foto de perfil actualizada.");
    await refresh();
    await refreshAuth();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nationality,
          number: Number(number) || 10,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Error al guardar");
      setMessage("Perfil actualizado.");
      await refresh();
      await refreshAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  if (!player) {
    return (
      <div className="py-20 text-center text-zinc-400">
        No tienes perfil de jugador vinculado.
      </div>
    );
  }

  const preview = {
    ...player,
    name,
    avatarUrl: avatarUrl ?? undefined,
    nationality,
    number: Number(number) || 10,
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Mi perfil"
        description="Configura tu foto y datos de jugador."
      />

      <Card>
        <CardBody>
          <div className="mb-6 flex flex-col items-center gap-3">
            <PlayerAvatar player={preview} size="lg" />
            <p className="text-lg font-bold text-white">{player.gamertag}</p>
            <p className="text-sm text-zinc-500">{user?.email}</p>
          </div>

          <ImageUpload
            label="Foto de perfil"
            uploadUrl="/api/upload/avatar"
            previewUrl={avatarUrl}
            previewFallback={
              <PlayerAvatar player={preview} size="lg" />
            }
            shape="circle"
            onUploaded={handleAvatarUploaded}
          />

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Nacionalidad"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              maxLength={3}
            />
            <Input
              label="Dorsal"
              type="number"
              min={1}
              max={99}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />

            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {message}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Guardando…" : "Guardar datos"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
