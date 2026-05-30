import type { AppData, Player } from "@/lib/types";
import { getPlayer } from "@/lib/utils/stats";

export type PlayerStatRow = {
  player: Player;
  value: number;
};

export function getCompetitionTopScorers(
  data: AppData,
  competitionId: string,
  limit = 10,
): PlayerStatRow[] {
  const goals = new Map<string, number>();

  for (const m of data.matches) {
    if (m.competitionId !== competitionId || m.status !== "finished") continue;
    for (const s of m.scorers) {
      goals.set(s.playerId, (goals.get(s.playerId) ?? 0) + 1);
    }
  }

  return [...goals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([playerId, value]) => ({
      player: getPlayer(data, playerId)!,
      value,
    }))
    .filter((r) => r.player);
}

export function getCompetitionTopAssists(
  data: AppData,
  competitionId: string,
  limit = 10,
): PlayerStatRow[] {
  const assists = new Map<string, number>();

  for (const m of data.matches) {
    if (m.competitionId !== competitionId || m.status !== "finished") continue;
    for (const a of m.assists) {
      assists.set(a.playerId, (assists.get(a.playerId) ?? 0) + 1);
    }
  }

  return [...assists.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([playerId, value]) => ({
      player: getPlayer(data, playerId)!,
      value,
    }))
    .filter((r) => r.player);
}
