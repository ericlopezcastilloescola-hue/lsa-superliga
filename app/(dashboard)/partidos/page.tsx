"use client";

import { useState } from "react";
import { MatchCard } from "@/components/matches/match-card";
import { PageHeader } from "@/components/ui/page-header";
import { useAppData } from "@/lib/store/data-context";

export default function PartidosPage() {
  const data = useAppData();
  const [filter, setFilter] = useState<"all" | "scheduled" | "finished">("all");

  const matches = [...data.matches]
    .filter((m) => filter === "all" || m.status === filter)
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );

  return (
    <div>
      <PageHeader
        title="Partidos"
        description="Calendario y resultados generados automáticamente por competición."
      />

      <div className="mb-6 flex gap-2">
        {(["all", "scheduled", "finished"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-cyan-500/15 text-cyan-400"
                : "text-zinc-500 hover:bg-white/5"
            }`}
          >
            {f === "all" ? "Todos" : f === "scheduled" ? "Próximos" : "Finalizados"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} data={data} />
        ))}
      </div>
    </div>
  );
}
