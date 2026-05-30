"use client";

import Link from "next/link";
import { ClubCrest } from "@/components/clubs/club-crest";
import { PlayerAvatar } from "@/components/players/player-avatar";
import type { AppData } from "@/lib/types";
import type { PlayerStatRow } from "@/lib/utils/competition-stats";
import { getClub } from "@/lib/utils/stats";

const MEDALS = ["🥇", "🥈", "🥉"];

function rankStyle(i: number): string {
  if (i === 0) return "border-amber-400/40 bg-gradient-to-r from-amber-500/10 to-transparent";
  if (i === 1) return "border-zinc-400/30 bg-gradient-to-r from-zinc-400/10 to-transparent";
  if (i === 2) return "border-amber-700/30 bg-gradient-to-r from-amber-900/10 to-transparent";
  return "border-white/5 bg-white/[0.02]";
}

export function TopStatsTable({
  rows,
  data,
  valueLabel,
  emptyMessage,
  scrollable = false,
}: {
  rows: PlayerStatRow[];
  data: AppData;
  valueLabel: string;
  emptyMessage: string;
  scrollable?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">{emptyMessage}</p>
    );
  }

  return (
    <div
      className={`space-y-2 ${scrollable ? "max-h-[28rem] overflow-y-auto pr-1" : ""}`}
    >
      {rows.map((row, i) => {
        const club = row.player.clubId
          ? getClub(data, row.player.clubId)
          : null;
        return (
          <Link
            key={row.player.id}
            href={`/jugadores/${row.player.id}`}
            className={`flex items-center gap-2 rounded-xl border px-3 py-3 transition-all hover:border-violet-500/40 hover:bg-violet-500/5 sm:gap-4 sm:px-4 sm:py-3.5 ${rankStyle(i)}`}
          >
            <span className="flex w-8 shrink-0 justify-center text-lg">
              {i < 3 ? MEDALS[i] : (
                <span className="font-mono text-sm text-zinc-500">{i + 1}</span>
              )}
            </span>
            <PlayerAvatar
              player={row.player}
              size={i < 3 ? "md" : "sm"}
            />
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {club && <ClubCrest club={club} size="sm" />}
              <div className="min-w-0">
                <p className="truncate font-bold text-white">
                  {row.player.gamertag}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {club?.name ?? "Sin club"}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={`font-mono text-xl font-black sm:text-2xl ${
                  row.value > 0 ? "text-violet-300" : "text-zinc-600"
                }`}
              >
                {row.value}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                {valueLabel}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
