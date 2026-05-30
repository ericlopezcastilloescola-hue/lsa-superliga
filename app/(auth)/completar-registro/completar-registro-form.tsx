"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LeagueLogo } from "@/components/brand/league-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { useAuth } from "@/lib/store/auth-context";

export default function CompletarRegistroForm() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/complete-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(fd.get("name")),
        gamertag: String(fd.get("gamertag")),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Error al completar el registro");
      return;
    }

    await refresh();
    router.push("/");
  }

  if (user?.playerId) {
    router.replace("/");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0E14] px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <LeagueLogo size="lg" />
        <h1 className="text-2xl font-bold text-white">Completa tu perfil</h1>
        <p className="max-w-sm text-sm text-zinc-500">
          Tu cuenta de Google está verificada. Elige tu gamertag para unirte a la liga.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre real"
              name="name"
              required
              defaultValue={searchParams.get("name") ?? ""}
            />
            <Input
              label="Gamertag (jugador)"
              name="gamertag"
              required
              placeholder="Tu nick en el juego"
            />
            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Guardando…" : "Entrar a la liga"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
