"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { CompetitionPhaseBuilder } from "@/components/admin/competition-phase-builder";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { useData } from "@/lib/store/data-context";
import {
  DEFAULT_PHASE,
  type CompetitionPhase,
} from "@/lib/types/competition-config";

export default function AdminCompeticionesPage() {
  const { createCompetition } = useData();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phases, setPhases] = useState<CompetitionPhase[]>([{ ...DEFAULT_PHASE }]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    if (phases.length === 0) {
      setError("Añade al menos una fase.");
      setLoading(false);
      return;
    }

    try {
      const id = await createCompetition({
        name: String(fd.get("name") || ""),
        season: new Date().getFullYear().toString(),
        status: "active",
        calendarMode: "manual",
        config: {
          calendarMode: "manual",
          phases: phases.map((p) => ({
            ...p,
            name: p.name.trim() || "Fase",
            tableMode: p.type === "tabla" ? (p.tableMode ?? "liga") : undefined,
            groupsCount: p.tableMode === "grupos" ? (p.groupsCount ?? 4) : undefined,
            teamsPerGroup:
              p.tableMode === "grupos" ? (p.teamsPerGroup ?? 0) : undefined,
            bracketTeams:
              p.type === "llaves" && p.bracketTeams === 0 ? 0 : p.bracketTeams,
          })),
          maxTeams: Number(fd.get("maxTeams")) || undefined,
          standingsEnabled: true,
        },
      });
      router.push(`/competiciones/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Crear competición"
        description="Primero crea la competición e inscribe equipos. Después genera el calendario desde ⋮ en la competición."
        action={
          <Link href="/admin" className="text-sm text-violet-400 hover:underline">
            ← Panel admin
          </Link>
        }
      />
      <Card className="max-w-2xl">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input label="Nombre" name="name" placeholder="LSA Superliga 2026" />

            <Input
              label="Máx. equipos (opcional)"
              name="maxTeams"
              type="number"
              min={2}
              placeholder="Sin límite"
            />

            <CompetitionPhaseBuilder phases={phases} onChange={setPhases} />

            <p className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-xs text-zinc-400">
              El calendario <strong>no</strong> se genera al crear. Entra en la
              competición, inscribe equipos y usa el menú ⋮ → Generar calendario.
            </p>

            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </p>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Creando…" : "Crear competición"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
