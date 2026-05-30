"use client";

import { useState } from "react";
import Link from "next/link";
import { MatchCard } from "@/components/matches/match-card";
import { PageHeader } from "@/components/ui/page-header";
import { useAppData } from "@/lib/store/data-context";

export default function AdminResultadosPage() {
  const data = useAppData();
  const [tab, setTab] = useState<"pendientes" | "jugados">("pendientes");

  const pending = data.matches
    .filter((m) => m.status === "scheduled")
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

  const finished = data.matches
    .filter((m) => m.status === "finished")
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );

  const list = tab === "pendientes" ? pending : finished;

  return (
    <div>
      <PageHeader
        title="Actualizar resultados"
        description="Introduce o edita marcadores, goleadores, asistencias y MVP. La clasificación se actualiza sola."
        action={
          <Link href="/admin" className="text-sm text-cyan-400 hover:underline">
            ← Panel admin
          </Link>
        }
      />

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("pendientes")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "pendientes"
              ? "bg-violet-500/15 text-violet-300"
              : "text-zinc-500 hover:bg-white/5"
          }`}
        >
          Pendientes ({pending.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("jugados")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "jugados"
              ? "bg-violet-500/15 text-violet-300"
              : "text-zinc-500 hover:bg-white/5"
          }`}
        >
          Jugados — editar ({finished.length})
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((m) => (
          <MatchCard key={m.id} match={m} data={data} />
        ))}
      </div>

      {list.length === 0 && (
        <p className="text-zinc-500">
          {tab === "pendientes"
            ? "No hay partidos pendientes de resultado."
            : "Aún no hay partidos finalizados."}
        </p>
      )}
    </div>
  );
}
