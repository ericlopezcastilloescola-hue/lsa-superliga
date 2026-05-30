import { isTbdClubId } from "@/lib/constants/tbd-club";
import type { Match } from "@/lib/types";
import { seriesAggregateScore, type KnockoutSeries } from "@/lib/utils/knockout-series";

export function parseFeederMatchIds(
  raw: string | string[] | null | undefined,
): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function findVueltaMatch(ida: Match, matches: Match[]): Match | undefined {
  if (ida.homeClubId && ida.awayClubId) {
    return matches.find(
      (m) =>
        m.id !== ida.id &&
        m.competitionId === ida.competitionId &&
        m.homeClubId === ida.awayClubId &&
        m.awayClubId === ida.homeClubId,
    );
  }

  const vueltaRound = `${ida.round ?? ""} — Vuelta`;
  return matches.find(
    (m) =>
      m.id !== ida.id &&
      m.competitionId === ida.competitionId &&
      m.round === vueltaRound,
  );
}

export function getSeriesForIda(idaMatchId: string, matches: Match[]): KnockoutSeries | null {
  const ida = matches.find((m) => m.id === idaMatchId);
  if (!ida) return null;
  const vuelta = findVueltaMatch(ida, matches);
  return { ida, vuelta };
}

/** Ganador de una serie (ida única o ida+vuelta). null si aún no hay ganador. */
export function getSeriesWinnerId(idaMatchId: string, matches: Match[]): string | null {
  const series = getSeriesForIda(idaMatchId, matches);
  if (!series) return null;

  const agg = seriesAggregateScore(series, matches);
  if (!agg.decided) return null;

  if ((agg.homeTotal ?? 0) === (agg.awayTotal ?? 0)) {
    return agg.homeClubId;
  }
  return (agg.homeTotal ?? 0) > (agg.awayTotal ?? 0)
    ? agg.homeClubId
    : agg.awayClubId;
}

/** Equipo en un hueco del bracket: null = por determinar. */
export function resolveBracketClubId(
  match: Match,
  slot: "home" | "away",
  matches: Match[],
): string | null {
  const feeders = parseFeederMatchIds(match.feederMatchIds);
  const feederIdx = slot === "home" ? 0 : 1;

  if (feeders[feederIdx]) {
    return getSeriesWinnerId(feeders[feederIdx], matches);
  }

  const stored = slot === "home" ? match.homeClubId : match.awayClubId;
  return isTbdClubId(stored) ? null : stored ?? null;
}

export function isBracketMatchReady(match: Match, matches: Match[]): boolean {
  return (
    resolveBracketClubId(match, "home", matches) !== null &&
    resolveBracketClubId(match, "away", matches) !== null
  );
}

export function resolveSeriesParticipants(
  series: KnockoutSeries,
  matches: Match[],
): { homeClubId: string | null; awayClubId: string | null } {
  const feeders = parseFeederMatchIds(series.ida.feederMatchIds);
  if (feeders.length >= 2) {
    return {
      homeClubId: getSeriesWinnerId(feeders[0], matches),
      awayClubId: getSeriesWinnerId(feeders[1], matches),
    };
  }
  return {
    homeClubId: isTbdClubId(series.ida.homeClubId) ? null : series.ida.homeClubId,
    awayClubId: isTbdClubId(series.ida.awayClubId) ? null : series.ida.awayClubId,
  };
}

/** Tras un partido, devuelve el id del partido de ida de la serie. */
export function resolveIdaMatchId(finished: Match, matches: Match[]): string {
  if (!finished.round?.includes("Vuelta")) return finished.id;

  if (finished.homeClubId && finished.awayClubId) {
    const ida = matches.find(
      (m) =>
        m.competitionId === finished.competitionId &&
        m.homeClubId === finished.awayClubId &&
        m.awayClubId === finished.homeClubId &&
        !m.round?.includes("Vuelta"),
    );
    return ida?.id ?? finished.id;
  }

  const baseRound = finished.round.replace(" — Vuelta", "");
  const ida = matches.find(
    (m) =>
      m.competitionId === finished.competitionId &&
      m.round === baseRound &&
      !m.round?.includes("Vuelta"),
  );
  return ida?.id ?? finished.id;
}

export function getSeriesWinnerFromFinishedMatch(
  finished: Match,
  matches: Match[],
): string | null {
  const idaId = resolveIdaMatchId(finished, matches);
  return getSeriesWinnerId(idaId, matches);
}
