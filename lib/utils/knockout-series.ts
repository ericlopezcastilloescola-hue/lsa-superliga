import type { Match } from "@/lib/types";
import {
  resolveSeriesParticipants,
  resolveBracketClubId,
} from "@/lib/utils/knockout-bracket";

export type KnockoutSeries = {
  ida: Match;
  vuelta?: Match;
};

/** Empareja ida y vuelta por clubes (local/visitante invertidos). */
export function groupKnockoutSeries(
  matchIds: string[],
  allMatches: Match[],
): KnockoutSeries[] {
  const byId = new Map(allMatches.map((m) => [m.id, m]));
  const used = new Set<string>();
  const series: KnockoutSeries[] = [];

  for (const id of matchIds) {
    if (used.has(id)) continue;
    const ida = byId.get(id);
    if (!ida) continue;
    used.add(id);

    const vueltaId = matchIds.find((otherId) => {
      if (used.has(otherId) || otherId === id) return false;
      const other = byId.get(otherId);
      if (!other) return false;
      if (ida.homeClubId && ida.awayClubId) {
        return (
          other.homeClubId === ida.awayClubId &&
          other.awayClubId === ida.homeClubId
        );
      }
      return other.round === `${ida.round ?? ""} — Vuelta`;
    });

    if (vueltaId) {
      used.add(vueltaId);
      series.push({ ida, vuelta: byId.get(vueltaId) });
    } else {
      series.push({ ida });
    }
  }

  return series;
}

export function seriesAggregateScore(
  series: KnockoutSeries,
  matches: Match[] = [],
): {
  homeClubId: string | null;
  awayClubId: string | null;
  homeTotal: number | null;
  awayTotal: number | null;
  decided: boolean;
} {
  const { ida, vuelta } = series;
  const participants = resolveSeriesParticipants(series, matches);
  const homeClubId = participants.homeClubId;
  const awayClubId = participants.awayClubId;

  if (!homeClubId || !awayClubId) {
    return { homeClubId, awayClubId, homeTotal: null, awayTotal: null, decided: false };
  }

  if (!vuelta) {
    const finished = ida.status === "finished";
    return {
      homeClubId,
      awayClubId,
      homeTotal: finished ? (ida.homeScore ?? 0) : null,
      awayTotal: finished ? (ida.awayScore ?? 0) : null,
      decided: finished,
    };
  }

  const idaDone = ida.status === "finished";
  const vueltaDone = vuelta.status === "finished";
  if (!idaDone || !vueltaDone) {
    return { homeClubId, awayClubId, homeTotal: null, awayTotal: null, decided: false };
  }

  const homeTotal = (ida.homeScore ?? 0) + (vuelta.awayScore ?? 0);
  const awayTotal = (ida.awayScore ?? 0) + (vuelta.homeScore ?? 0);
  return { homeClubId, awayClubId, homeTotal, awayTotal, decided: true };
}

export function seriesIsPlayable(series: KnockoutSeries, matches: Match[]): boolean {
  const p = resolveSeriesParticipants(series, matches);
  return p.homeClubId !== null && p.awayClubId !== null;
}

