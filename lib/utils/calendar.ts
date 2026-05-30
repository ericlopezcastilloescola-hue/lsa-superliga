import type { CreateMatchInput } from "@/lib/types";

/** Genera emparejamientos todos contra todos (una vuelta), aplanados. */
export function buildRoundRobinPairings(clubIds: string[]): [string, string][] {
  return buildRoundRobinRounds(clubIds).flat();
}

/** Una jornada = una ronda del método del círculo (cada equipo juega como máximo 1 partido). */
export function buildRoundRobinRounds(clubIds: string[]): [string, string][][] {
  if (clubIds.length < 2) return [];

  const teams = [...clubIds];
  if (teams.length % 2 !== 0) teams.push("__bye__");

  const n = teams.length;
  const half = n / 2;
  const rounds: [string, string][][] = [];
  const rotation = [...teams];

  for (let r = 0; r < n - 1; r++) {
    const round: [string, string][] = [];
    for (let i = 0; i < half; i++) {
      const home = rotation[i];
      const away = rotation[n - 1 - i];
      if (home !== "__bye__" && away !== "__bye__") {
        round.push([home, away]);
      }
    }
    if (round.length > 0) rounds.push(round);

    const fixed = rotation[0];
    const rest = rotation.slice(1);
    rest.unshift(rest.pop()!);
    rotation.splice(0, rotation.length, fixed, ...rest);
  }

  return rounds;
}

export function buildRoundRobinMatches(
  competitionId: string,
  clubIds: string[],
  matchdayId: string,
  startDate: string,
): Omit<CreateMatchInput, "status">[] {
  const pairings = buildRoundRobinPairings(clubIds);
  const base = new Date(startDate);

  return pairings.map(([homeClubId, awayClubId], i) => {
    const d = new Date(base);
    d.setHours(20 + (i % 3), (i % 2) * 30, 0, 0);
    d.setDate(d.getDate() + Math.floor(i / 3));
    return {
      competitionId,
      matchdayId,
      homeClubId,
      awayClubId,
      scheduledAt: d.toISOString(),
    };
  });
}
