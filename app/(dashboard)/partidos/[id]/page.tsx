"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ClubCrest } from "@/components/clubs/club-crest";
import { MatchEditor } from "@/components/matches/match-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ESTADO_PARTIDO } from "@/lib/i18n/es";
import { useAppData, useData } from "@/lib/store/data-context";
import { useAuth } from "@/lib/store/auth-context";
import {
  formatDate,
  getClub,
  getCompetition,
  getPlayer,
} from "@/lib/utils/stats";
import { resolveBracketClubId } from "@/lib/utils/knockout-bracket";

export default function PartidoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const data = useAppData();
  const { updateMatchResult } = useData();
  const { canEditResults } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const match = data.matches.find((m) => m.id === id);

  const roundLabel = useMemo(() => {
    if (!match) return undefined;
    const comp = getCompetition(data, match.competitionId);
    const md = data.matchdays.find((m) => m.id === match.matchdayId);
    const parts = [comp?.name, md?.name ?? match.round].filter(Boolean);
    return parts.join(" · ");
  }, [match, data]);

  if (!match) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-400">Partido no encontrado.</p>
        <Button href="/partidos" className="mt-4">
          Volver a partidos
        </Button>
      </div>
    );
  }

  const homeClubId = resolveBracketClubId(match, "home", data.matches);
  const awayClubId = resolveBracketClubId(match, "away", data.matches);

  if (!homeClubId || !awayClubId) {
    const comp = getCompetition(data, match.competitionId);
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <p className="text-lg text-zinc-300">Partido pendiente</p>
        <p className="mt-2 text-sm text-zinc-500">
          Los equipos se definirán cuando terminen las series de la ronda anterior.
        </p>
        {comp && (
          <Button href={`/competiciones/${comp.id}/eliminatorias`} className="mt-6">
            Ver cuadro eliminatorio
          </Button>
        )}
      </div>
    );
  }

  const home = getClub(data, homeClubId)!;
  const away = getClub(data, awayClubId)!;
  const comp = getCompetition(data, match.competitionId);
  const isFinished = match.status === "finished";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href={comp ? `/competiciones/${comp.id}` : "/partidos"}
            className="text-sm text-violet-400 hover:underline"
          >
            ← Volver
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-white">
            {home.name} vs {away.name}
          </h1>
          <p className="text-sm text-zinc-500">
            {roundLabel} · {formatDate(match.scheduledAt)}
          </p>
        </div>
        <Badge color={isFinished ? "green" : match.status === "live" ? "pink" : "zinc"}>
          {ESTADO_PARTIDO[match.status]}
        </Badge>
      </div>

      {!canEditResults && (
        <div className="overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-b from-[#141820] to-[#0f1219] shadow-[0_0_60px_-15px_rgba(139,92,246,0.3)]">
          <div className="grid grid-cols-1 items-center gap-8 px-8 py-12 md:grid-cols-[1fr_auto_1fr]">
            <div className="flex flex-col items-center gap-4">
              <ClubCrest club={home} size="lg" />
              <span className="text-xl font-black uppercase text-white">{home.name}</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 px-8 py-5 font-mono text-5xl font-black text-rose-400 md:text-6xl">
              {isFinished ? (
                <>
                  {match.homeScore} : {match.awayScore}
                </>
              ) : (
                <span className="text-2xl text-zinc-500">vs</span>
              )}
            </div>
            <div className="flex flex-col items-center gap-4">
              <ClubCrest club={away} size="lg" />
              <span className="text-xl font-black uppercase text-white">{away.name}</span>
            </div>
          </div>
          {isFinished && match.scorers.length > 0 && (
            <div className="border-t border-white/10 px-8 py-5 text-center text-sm text-zinc-400">
              Goleadores:{" "}
              {match.scorers
                .map((s) => getPlayer(data, s.playerId)?.gamertag)
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
        </div>
      )}

      {canEditResults && (
        <>
          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </p>
          )}
          <MatchEditor
            key={`${match.id}-${match.status}-${match.homeScore}-${match.awayScore}-${match.scorers.length}`}
            match={{ ...match, homeClubId, awayClubId }}
            data={data}
            roundLabel={roundLabel}
            onSave={async (result) => {
              setError(null);
              const err = await updateMatchResult(id, result);
              if (err) setError(err);
              return err;
            }}
          />
        </>
      )}

      {!canEditResults && (
        <p className="text-center text-sm text-zinc-500">
          Solo administradores pueden editar resultados.
        </p>
      )}
    </div>
  );
}
