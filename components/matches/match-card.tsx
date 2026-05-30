"use client";

import Link from "next/link";
import { ClubCrest } from "@/components/clubs/club-crest";
import { Badge } from "@/components/ui/badge";
import type { AppData, Match } from "@/lib/types";
import { formatDate, getClub, getCompetition } from "@/lib/utils/stats";

export function MatchCard({ match, data }: { match: Match; data: AppData }) {
  const home = getClub(data, match.homeClubId);
  const away = getClub(data, match.awayClubId);
  const comp = getCompetition(data, match.competitionId);
  if (!home || !away) return null;

  const isFinished = match.status === "finished";
  const isLive = match.status === "live";

  return (
    <Link
      href={`/partidos/${match.id}`}
      className="block rounded-xl border border-white/10 bg-[#12151c]/80 p-4 transition-all hover:border-cyan-500/30 hover:shadow-[0_0_24px_rgba(0,240,255,0.06)]"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs text-zinc-500">{comp?.name}</span>
        {match.round && <Badge color="purple">{match.round}</Badge>}
        {isLive && <Badge color="pink">EN VIVO</Badge>}
        {isFinished && <Badge color="green">Final</Badge>}
        {match.status === "scheduled" && <Badge color="zinc">Próximo</Badge>}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <ClubCrest club={home} size="sm" />
          <span className="truncate font-medium">{home.name}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2 font-mono text-xl font-bold">
          {isFinished ? (
            <>
              <span>{match.homeScore}</span>
              <span className="text-zinc-600">-</span>
              <span>{match.awayScore}</span>
            </>
          ) : (
            <span className="text-sm text-zinc-500">vs</span>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <span className="truncate text-right font-medium">{away.name}</span>
          <ClubCrest club={away} size="sm" />
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-zinc-500">
        {formatDate(match.scheduledAt)}
      </p>
    </Link>
  );
}
