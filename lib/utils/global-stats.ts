import type { AppData } from "@/lib/types";
import type { PlayerStatRow } from "@/lib/utils/competition-stats";

function sortPlayerStats(rows: PlayerStatRow[]): PlayerStatRow[] {
  return rows.sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    return a.player.gamertag.localeCompare(b.player.gamertag, "es");
  });
}

/** Goleadores globales: todos los jugadores, más goles arriba. */
export function getGlobalTopScorers(data: AppData): PlayerStatRow[] {
  return sortPlayerStats(
    data.players.map((player) => ({
      player,
      value: player.goals,
    })),
  );
}

/** Asistencias globales: todos los jugadores, más asistencias arriba. */
export function getGlobalTopAssists(data: AppData): PlayerStatRow[] {
  return sortPlayerStats(
    data.players.map((player) => ({
      player,
      value: player.assists,
    })),
  );
}
