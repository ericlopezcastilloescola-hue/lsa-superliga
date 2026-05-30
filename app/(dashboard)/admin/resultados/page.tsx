"use client";

import { useState } from "react";
import Link from "next/link";
import { MatchCard } from "@/components/matches/match-card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { useAppData, useData } from "@/lib/store/data-context";
import { getClub } from "@/lib/utils/stats";

export default function AdminResultadosPage() {
  const data = useAppData();
  const { reviewMatchReport } = useData();
  const [tab, setTab] = useState<"informes" | "pendientes" | "jugados">("informes");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pendingReports = data.matchReports
    .filter((r) => r.status === "pending")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

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

  async function handleReview(
    matchId: string,
    reportId: string,
    action: "approve" | "reject",
  ) {
    setLoadingId(reportId);
    try {
      await reviewMatchReport(matchId, reportId, action);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Actualizar resultados"
        description="Aprueba informes de capitanes o edita marcadores directamente."
        action={
          <Link href="/admin" className="text-sm text-cyan-400 hover:underline">
            ← Panel admin
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("informes")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "informes"
              ? "bg-violet-500/15 text-violet-300"
              : "text-zinc-500 hover:bg-white/5"
          }`}
        >
          Informes pendientes ({pendingReports.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("pendientes")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "pendientes"
              ? "bg-violet-500/15 text-violet-300"
              : "text-zinc-500 hover:bg-white/5"
          }`}
        >
          Partidos sin jugar ({pending.length})
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

      {tab === "informes" && (
        <div className="space-y-4">
          {pendingReports.map((report) => {
            const match = data.matches.find((m) => m.id === report.matchId);
            const home = match?.homeClubId
              ? getClub(data, match.homeClubId)
              : undefined;
            const away = match?.awayClubId
              ? getClub(data, match.awayClubId)
              : undefined;

            return (
              <div
                key={report.id}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">
                      {home?.name ?? "?"} vs {away?.name ?? "?"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Informe de {report.clubName ?? report.clubId} ·{" "}
                      {report.submitterGamertag ?? "Capitán"}
                    </p>
                    <p className="mt-2 font-mono text-2xl text-rose-400">
                      {report.homeScore} - {report.awayScore}
                    </p>
                    {report.scorers.length > 0 && (
                      <p className="mt-2 text-xs text-zinc-500">
                        {report.scorers.length} goleador(es) · {report.assists.length}{" "}
                        asistencia(s)
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      href={`/partidos/${report.matchId}`}
                      variant="secondary"
                    >
                      Ver partido
                    </Button>
                    <Button
                      type="button"
                      disabled={loadingId === report.id}
                      onClick={() =>
                        handleReview(report.matchId, report.id, "approve")
                      }
                    >
                      Aprobar
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={loadingId === report.id}
                      onClick={() =>
                        handleReview(report.matchId, report.id, "reject")
                      }
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          {pendingReports.length === 0 && (
            <p className="text-zinc-500">No hay informes pendientes de revisión.</p>
          )}
        </div>
      )}

      {tab !== "informes" && (
        <>
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
        </>
      )}
    </div>
  );
}
