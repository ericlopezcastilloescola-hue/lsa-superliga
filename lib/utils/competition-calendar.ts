import type { CompetitionType, CreateMatchInput } from "@/lib/types";
import type { CompetitionConfig, CompetitionPhase } from "@/lib/types/competition-config";
import { TBD_CLUB_ID } from "@/lib/constants/tbd-club";
import { buildRoundRobinRounds } from "@/lib/utils/calendar";
import { groupLabel, splitIntoGroups } from "@/lib/utils/group-split";

export interface CalendarResult {
  matchdays: {
    number: number;
    name: string;
    startDate: string;
  }[];
  matches: (Omit<CreateMatchInput, "status" | "matchdayId"> & {
    matchdayIndex: number;
    feederMatchIndices?: [number, number];
  })[];
  knockoutRounds: {
    name: string;
    order: number;
    matchIndices: number[];
  }[];
}

function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function scheduleMatchesForMatchday(
  competitionId: string,
  matchdayIndex: number,
  pairings: [string, string][],
  startDate: string,
  round?: string,
  feederMatchIndicesList?: ([number, number] | undefined)[],
): CalendarResult["matches"] {
  const base = new Date(startDate);
  return pairings.map(([homeClubId, awayClubId], i) => {
    const d = new Date(base);
    d.setHours(20 + (i % 3), (i % 2) * 30, 0, 0);
    return {
      competitionId,
      matchdayIndex,
      homeClubId,
      awayClubId,
      scheduledAt: d.toISOString(),
      round,
      feederMatchIndices: feederMatchIndicesList?.[i],
    };
  });
}

/** Rondas ida (+ vuelta opcional), respetando round-robin real. */
function buildTableRounds(
  clubIds: string[],
  homeAndAway: boolean,
  roundCount: number,
): [string, string][][] {
  if (clubIds.length < 2) return [];

  const idaRounds = buildRoundRobinRounds(clubIds);
  const allRounds = homeAndAway
    ? [
        ...idaRounds,
        ...idaRounds.map((round) =>
          round.map(([h, a]) => [a, h] as [string, string]),
        ),
      ]
    : idaRounds;

  const naturalCount = allRounds.length;
  if (naturalCount === 0) return [];

  const target =
    roundCount > 0 ? Math.min(roundCount, naturalCount) : naturalCount;

  const selected = allRounds.slice(0, target);

  if (roundCount > naturalCount) {
    while (selected.length < roundCount) {
      selected.push([]);
    }
  }

  return selected;
}

function knockoutRoundName(teamCount: number): string {
  if (teamCount <= 2) return "Final";
  if (teamCount <= 4) return "Semifinales";
  if (teamCount <= 8) return "Cuartos de final";
  if (teamCount <= 16) return "Octavos de final";
  return `Ronda de ${teamCount}`;
}

function seedKnockoutTeams(clubIds: string[]): string[] {
  const n = nextPowerOfTwo(clubIds.length);
  const seeded = [...clubIds];
  while (seeded.length < n) seeded.push("__bye__");
  return seeded;
}

function buildFirstKnockoutPairings(clubIds: string[]): [string, string][] {
  const seeded = seedKnockoutTeams(clubIds);
  const n = seeded.length;
  const pairings: [string, string][] = [];
  for (let i = 0; i < n / 2; i++) {
    const home = seeded[i];
    const away = seeded[n - 1 - i];
    if (home !== "__bye__" && away !== "__bye__") {
      pairings.push([home, away]);
    }
  }
  return pairings;
}

function generateFullKnockoutBracket(
  competitionId: string,
  clubIds: string[],
  startDate: string,
  homeAndAway = false,
): Pick<CalendarResult, "matchdays" | "matches" | "knockoutRounds"> {
  const matchdays: CalendarResult["matchdays"] = [];
  const matches: CalendarResult["matches"] = [];
  const knockoutRounds: CalendarResult["knockoutRounds"] = [];

  const firstPairings = buildFirstKnockoutPairings(clubIds);
  if (firstPairings.length === 0) {
    return { matchdays, matches, knockoutRounds };
  }

  const totalRounds = Math.ceil(Math.log2(firstPairings.length * 2));
  const roundMatchIndices: number[][] = [];

  for (let r = 0; r < totalRounds; r++) {
    const teamsInRound = (firstPairings.length * 2) / Math.pow(2, r);
    const roundName = knockoutRoundName(Math.max(teamsInRound, 2));
    const mdStart = new Date(startDate);
    mdStart.setDate(mdStart.getDate() + r * 7);
    const mdIndex = matchdays.length;

    matchdays.push({
      number: mdIndex + 1,
      name: roundName,
      startDate: mdStart.toISOString().slice(0, 10),
    });

    if (r === 0) {
      const roundMatches = scheduleMatchesForMatchday(
        competitionId,
        mdIndex,
        firstPairings,
        mdStart.toISOString().slice(0, 10),
        roundName,
      );
      const startIdx = matches.length;
      matches.push(...roundMatches);
      roundMatchIndices.push(roundMatches.map((_, i) => startIdx + i));
    } else {
      const prev = roundMatchIndices[r - 1] ?? [];
      const pairings: [string, string][] = [];
      const feeders: ([number, number] | undefined)[] = [];

      for (let i = 0; i < prev.length; i += 2) {
        const m1 = matches[prev[i]];
        const m2 = matches[prev[i + 1]];
        if (!m1 || !m2) continue;
        pairings.push([TBD_CLUB_ID, TBD_CLUB_ID]);
        feeders.push([prev[i], prev[i + 1]]);
      }

      const roundMatches = scheduleMatchesForMatchday(
        competitionId,
        mdIndex,
        pairings,
        mdStart.toISOString().slice(0, 10),
        roundName,
        feeders,
      );
      const startIdx = matches.length;
      matches.push(...roundMatches);
      roundMatchIndices.push(roundMatches.map((_, i) => startIdx + i));

      knockoutRounds.push({
        name: roundName,
        order: r + 1,
        matchIndices: roundMatches.map((_, i) => startIdx + i),
      });
    }
  }

  if (roundMatchIndices[0]) {
    knockoutRounds.unshift({
      name: matchdays[0]?.name ?? "Primera ronda",
      order: 1,
      matchIndices: roundMatchIndices[0],
    });
  }

  if (homeAndAway && matches.length > 0) {
    const idaMatchdays = matchdays.length;
    const idaCount = matches.length;
    const returnLegByIdaIndex = new Map<number, number>();

    for (let r = 0; r < idaMatchdays; r++) {
      const returnMdIndex = matchdays.length;
      const mdStart = new Date(startDate);
      mdStart.setDate(mdStart.getDate() + (idaMatchdays + r) * 7);
      matchdays.push({
        number: returnMdIndex + 1,
        name: `${matchdays[r]?.name ?? "Ronda"} (vuelta)`,
        startDate: mdStart.toISOString().slice(0, 10),
      });

      for (let i = 0; i < idaCount; i++) {
        const m = matches[i];
        if (m.matchdayIndex !== r) continue;
        matches.push({
          ...m,
          matchdayIndex: returnMdIndex,
          homeClubId: m.awayClubId,
          awayClubId: m.homeClubId,
          round: `${m.round ?? matchdays[r]?.name ?? "Ronda"} — Vuelta`,
          scheduledAt: new Date(
            new Date(m.scheduledAt).getTime() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        });
        returnLegByIdaIndex.set(i, matches.length - 1);
      }
    }

    for (const kr of knockoutRounds) {
      kr.matchIndices = kr.matchIndices.flatMap((idx) => {
        const ret = returnLegByIdaIndex.get(idx);
        return ret !== undefined ? [idx, ret] : [idx];
      });
    }
  }

  return { matchdays, matches, knockoutRounds };
}

function mergeCalendar(target: CalendarResult, source: CalendarResult): void {
  const matchBase = target.matches.length;
  const mdBase = target.matchdays.length;

  source.matchdays.forEach((md, i) => {
    target.matchdays.push({
      ...md,
      number: mdBase + i + 1,
    });
  });

  for (const m of source.matches) {
    target.matches.push({
      ...m,
      matchdayIndex: mdBase + m.matchdayIndex,
      feederMatchIndices: m.feederMatchIndices
        ? ([
            matchBase + m.feederMatchIndices[0],
            matchBase + m.feederMatchIndices[1],
          ] as [number, number])
        : undefined,
    });
  }

  for (const kr of source.knockoutRounds) {
    target.knockoutRounds.push({
      ...kr,
      matchIndices: kr.matchIndices.map((i) => matchBase + i),
    });
  }
}

function generatePhaseTablaLiga(
  competitionId: string,
  clubIds: string[],
  phase: CompetitionPhase,
  startDate: string,
): CalendarResult {
  const result: CalendarResult = { matchdays: [], matches: [], knockoutRounds: [] };
  const roundsToSchedule = buildTableRounds(
    clubIds,
    phase.homeAndAway ?? false,
    phase.roundCount ?? 0,
  );

  roundsToSchedule.forEach((round, idx) => {
    const mdStart = new Date(startDate);
    mdStart.setDate(mdStart.getDate() + idx * 7);
    const mdIndex = result.matchdays.length;
    const rondaNum = idx + 1;

    result.matchdays.push({
      number: mdIndex + 1,
      name: `${phase.name} — Ronda ${rondaNum}`,
      startDate: mdStart.toISOString().slice(0, 10),
    });

    if (round.length > 0) {
      result.matches.push(
        ...scheduleMatchesForMatchday(
          competitionId,
          mdIndex,
          round,
          mdStart.toISOString().slice(0, 10),
          `Ronda ${rondaNum}`,
        ),
      );
    }
  });

  return result;
}

/** Varios grupos: misma ronda = todos los grupos juegan (estilo liga/Toornament). */
function generatePhaseTablaGrupos(
  competitionId: string,
  clubIds: string[],
  phase: CompetitionPhase,
  startDate: string,
): CalendarResult {
  const result: CalendarResult = { matchdays: [], matches: [], knockoutRounds: [] };

  const groupsCount = Math.max(1, phase.groupsCount ?? 2);
  const teamsPerGroup = phase.teamsPerGroup ?? 0;
  const groups = splitIntoGroups(clubIds, groupsCount, teamsPerGroup);

  if (groups.length === 0) return result;

  const groupRounds = groups.map((g) =>
    buildTableRounds(g, phase.homeAndAway ?? false, phase.roundCount ?? 0),
  );

  const maxRounds = Math.max(...groupRounds.map((r) => r.length), 0);
  if (maxRounds === 0) return result;

  for (let r = 0; r < maxRounds; r++) {
    const mdStart = new Date(startDate);
    mdStart.setDate(mdStart.getDate() + r * 7);
    const mdIndex = result.matchdays.length;
    const rondaNum = r + 1;

    result.matchdays.push({
      number: mdIndex + 1,
      name: `${phase.name} — Ronda ${rondaNum}`,
      startDate: mdStart.toISOString().slice(0, 10),
    });

    for (let g = 0; g < groups.length; g++) {
      const round = groupRounds[g][r];
      if (!round?.length) continue;
      const label = groupLabel(g);
      result.matches.push(
        ...scheduleMatchesForMatchday(
          competitionId,
          mdIndex,
          round,
          mdStart.toISOString().slice(0, 10),
          label,
        ),
      );
    }
  }

  return result;
}

function generatePhaseTabla(
  competitionId: string,
  clubIds: string[],
  phase: CompetitionPhase,
  startDate: string,
): CalendarResult {
  const mode = phase.tableMode ?? "liga";
  if (mode === "grupos") {
    return generatePhaseTablaGrupos(competitionId, clubIds, phase, startDate);
  }
  return generatePhaseTablaLiga(competitionId, clubIds, phase, startDate);
}

function generatePhaseLlaves(
  competitionId: string,
  clubIds: string[],
  phase: CompetitionPhase,
  startDate: string,
): CalendarResult {
  const teamCount =
    phase.bracketTeams && phase.bracketTeams > 0
      ? Math.min(phase.bracketTeams, clubIds.length)
      : clubIds.length;
  const teams = clubIds.slice(0, teamCount);
  const legs = Math.max(1, phase.matchesPerSeries ?? 1);
  const homeAndAway =
    legs >= 2 || (phase.eliminationMode === "doble" && legs === 1);

  const bracket = generateFullKnockoutBracket(
    competitionId,
    teams,
    startDate,
    homeAndAway,
  );

  for (const md of bracket.matchdays) {
    md.name = `${phase.name} — ${md.name}`;
  }

  return {
    matchdays: bracket.matchdays,
    matches: bracket.matches,
    knockoutRounds: bracket.knockoutRounds.map((kr) => ({
      ...kr,
      name: `${phase.name} — ${kr.name}`,
    })),
  };
}

function generateFromPhases(
  competitionId: string,
  clubIds: string[],
  phases: CompetitionPhase[],
  startDate: string,
): CalendarResult {
  const result: CalendarResult = { matchdays: [], matches: [], knockoutRounds: [] };
  let dateCursor = startDate;

  for (const phase of phases) {
    const phaseResult =
      phase.type === "tabla"
        ? generatePhaseTabla(competitionId, clubIds, phase, dateCursor)
        : generatePhaseLlaves(competitionId, clubIds, phase, dateCursor);

    mergeCalendar(result, phaseResult);

    const lastMd = phaseResult.matchdays[phaseResult.matchdays.length - 1];
    if (lastMd) {
      const d = new Date(lastMd.startDate);
      d.setDate(d.getDate() + phaseResult.matchdays.length * 7);
      dateCursor = d.toISOString().slice(0, 10);
    }
  }

  return result;
}

export function validateCalendarConfig(
  clubIds: string[],
  config?: CompetitionConfig,
): string | null {
  if (clubIds.length < 2) {
    return "Inscribe al menos 2 equipos.";
  }

  const phases = config?.phases ?? [];
  if (phases.length === 0) {
    return "La competición no tiene fases configuradas.";
  }

  for (const phase of phases) {
    if (phase.type !== "tabla") continue;

    if (phase.tableMode === "grupos") {
      const gc = Math.max(1, phase.groupsCount ?? 2);
      const tpg = phase.teamsPerGroup ?? 0;

      if (tpg > 0 && gc * tpg > clubIds.length) {
        return `Para ${gc} grupos de ${tpg} equipos necesitas al menos ${gc * tpg} equipos inscritos (tienes ${clubIds.length}).`;
      }

      const groups = splitIntoGroups(clubIds, gc, tpg);
      const invalid = groups.filter((g) => g.length < 2);
      if (invalid.length > 0) {
        return `Hay grupos con menos de 2 equipos. Ajusta el número de grupos/equipos por grupo o inscribe más clubes.`;
      }
    }
  }

  return null;
}

export function generateCompetitionCalendar(
  competitionId: string,
  type: CompetitionType,
  clubIds: string[],
  startDate = new Date().toISOString().slice(0, 10),
  config?: CompetitionConfig,
): CalendarResult {
  const sortedIds = [...clubIds].sort();

  if (sortedIds.length < 2) {
    return { matchdays: [], matches: [], knockoutRounds: [] };
  }

  if (config?.phases?.length) {
    return generateFromPhases(competitionId, sortedIds, config.phases, startDate);
  }

  const homeAndAway = type === "ida_vuelta" || config?.homeAndAway === true;

  if (type === "liga" || type === "ida_vuelta") {
    return generatePhaseTabla(
      competitionId,
      sortedIds,
      { name: "Liga", type: "tabla", tableMode: "liga", homeAndAway },
      startDate,
    );
  }

  if (type === "eliminatoria_directa") {
    return generatePhaseLlaves(
      competitionId,
      sortedIds,
      {
        name: "Eliminatoria",
        type: "llaves",
        eliminationMode: "directa",
        matchesPerSeries: homeAndAway ? 2 : 1,
      },
      startDate,
    );
  }

  if (type === "grupos_eliminatoria") {
    const groupsPhase: CompetitionPhase = {
      name: "Fase de grupos",
      type: "tabla",
      tableMode: "grupos",
      groupsCount: config?.groupsCount ?? 4,
      teamsPerGroup: config?.teamsPerGroup ?? 0,
      homeAndAway: config?.homeAndAway ?? false,
    };
    const koPhase: CompetitionPhase = {
      name: "Eliminatoria",
      type: "llaves",
      eliminationMode: "directa",
      bracketTeams: config?.knockoutTeams ?? 0,
      matchesPerSeries: homeAndAway ? 2 : 1,
    };
    return generateFromPhases(
      competitionId,
      sortedIds,
      [groupsPhase, koPhase],
      startDate,
    );
  }

  return { matchdays: [], matches: [], knockoutRounds: [] };
}

export function hasStandings(type: CompetitionType, config?: CompetitionConfig): boolean {
  if (config?.standingsEnabled === false) return false;
  if (config?.phases?.length) {
    return config.phases.some((p) => p.type === "tabla");
  }
  return type === "liga" || type === "ida_vuelta" || type === "grupos_eliminatoria";
}

export function hasKnockout(type: CompetitionType, config?: CompetitionConfig): boolean {
  if (config?.phases?.length) {
    return config.phases.some((p) => p.type === "llaves");
  }
  return type === "eliminatoria_directa" || type === "grupos_eliminatoria";
}

export function getCompetitionGroupLabels(
  clubIds: string[],
  config?: CompetitionConfig,
): string[] {
  const phase = config?.phases?.find(
    (p) => p.type === "tabla" && p.tableMode === "grupos",
  );
  if (!phase) return [];

  const gc = Math.max(1, phase.groupsCount ?? 2);
  const groups = splitIntoGroups(clubIds, gc, phase.teamsPerGroup ?? 0);
  return groups.map((_, i) => groupLabel(i));
}

export function usesGroupTables(config?: CompetitionConfig): boolean {
  return (
    config?.phases?.some((p) => p.type === "tabla" && p.tableMode === "grupos") ??
    false
  );
}
