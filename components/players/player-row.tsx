"use client";

import Link from "next/link";
import { ClubCrest } from "@/components/clubs/club-crest";
import { Badge } from "@/components/ui/badge";
import type { AppData, Player } from "@/lib/types";
import { getClub } from "@/lib/utils/stats";

export function PlayerRow({
  player,
  data,
  stat,
}: {
  player: Player;
  data: AppData;
  stat?: "goals" | "assists" | "rating" | "mvp";
}) {
  const club = player.clubId ? getClub(data, player.clubId) : null;
  const statValue =
    stat === "goals"
      ? player.goals
      : stat === "assists"
        ? player.assists
        : stat === "mvp"
          ? player.mvpAwards
          : player.rating.toFixed(1);

  return (
    <Link
      href={`/jugadores/${player.id}`}
      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/5"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-cyan-400">
        {player.number || "—"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{player.gamertag}</p>
        <p className="truncate text-xs text-zinc-500">{player.name}</p>
      </div>
      {club ? (
        <ClubCrest club={club} size="sm" />
      ) : (
        <Badge color="zinc">Libre</Badge>
      )}
      {stat && (
        <span className="min-w-[2rem] text-right font-mono text-lg font-bold text-cyan-400">
          {statValue}
        </span>
      )}
    </Link>
  );
}
