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
  limit,
}: {
  rows: PlayerStatRow[];
  data: AppData;
  valueLabel: string;
  emptyMessage: string;
  scrollable?: boolean;
  limit?: number;
}) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500 sm:py-8">{emptyMessage}</p>
    );
  }

  const visible = limit ? rows.slice(0, limit) : rows;

  return (
    <div
      className={`space-y-1.5 sm:space-y-2 ${scrollable ? "max-h-64 overflow-y-auto pr-0.5 sm:max-h-[28rem]" : ""}`}
    >
      {visible.map((row, i) => {
        const club = row.player.clubId
          ? getClub(data, row.player.clubId)
          : null;
        return (
          <Link
            key={row.player.id}
            href={`/jugadores/${row.player.id}`}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-all hover:border-violet-500/40 hover:bg-violet-500/5 sm:gap-4 sm:rounded-xl sm:px-4 sm:py-3.5 ${rankStyle(i)}`}
          >
            <span className="flex w-6 shrink-0 justify-center text-base sm:w-8 sm:text-lg">
              {i < 3 ? MEDALS[i] : (
                <span className="font-mono text-xs text-zinc-500 sm:text-sm">{i + 1}</span>
              )}
            </span>
            <PlayerAvatar
              player={row.player}
              size={i < 3 ? "sm" : "sm"}
            />
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              {club && (
                <span className="hidden sm:inline-flex">
                  <ClubCrest club={club} size="sm" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white sm:text-base">
                  {row.player.gamertag}
                </p>
                <p className="truncate text-[10px] text-zinc-500 sm:text-xs">
                  {club?.name ?? "Sin club"}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={`font-mono text-lg font-black sm:text-2xl ${
                  row.value > 0 ? "text-violet-300" : "text-zinc-600"
                }`}
              >
                {row.value}
              </p>
              <p className="text-[9px] uppercase tracking-wider text-zinc-600 sm:text-[10px]">
                {valueLabel}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
