"use client";

import Link from "next/link";
import { ClubCrest } from "@/components/clubs/club-crest";
import type { AppData, StandingRow } from "@/lib/types";
import { getClub } from "@/lib/utils/stats";

function winPct(row: StandingRow): string {
  const max = row.played * 3;
  if (max === 0) return "0%";
  return `${Math.round((row.points / max) * 100)}%`;
}

function posStyle(pos: number, total: number): string {
  if (pos === 1) return "border-l-4 border-l-amber-400 bg-amber-400/5";
  if (pos === 2) return "border-l-4 border-l-zinc-400 bg-zinc-400/5";
  if (pos === 3) return "border-l-4 border-l-amber-700/80 bg-amber-900/10";
  if (pos === total) return "border-l-4 border-l-rose-500/50 bg-rose-500/5";
  return "border-l-4 border-l-transparent";
}

export function TournamentStandingsTable({
  rows,
  data,
  groupName = "Grupo 1",
}: {
  rows: StandingRow[];
  data: AppData;
  groupName?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-violet-400">
        {groupName}
      </p>
      <table className="w-full min-w-[720px] border-collapse text-base">
        <thead>
          <tr className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <th className="px-3 py-3 text-center">#</th>
            <th className="px-3 py-3 text-left">Equipo</th>
            <th className="px-3 py-3 text-center text-violet-300">Pts</th>
            <th className="px-3 py-3 text-center">PJ</th>
            <th className="px-3 py-3 text-center">V</th>
            <th className="px-3 py-3 text-center">E</th>
            <th className="px-3 py-3 text-center">P</th>
            <th className="px-3 py-3 text-center">GF</th>
            <th className="px-3 py-3 text-center">GC</th>
            <th className="px-3 py-3 text-center">DG</th>
            <th className="px-3 py-3 text-center">%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const club = getClub(data, row.clubId);
            if (!club) return null;
            const pos = i + 1;
            return (
              <tr
                key={row.clubId}
                className={`border-b border-white/5 transition-colors hover:bg-white/[0.04] ${posStyle(pos, rows.length)}`}
              >
                <td className="px-3 py-4 text-center">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      pos <= 3
                        ? "bg-violet-500/20 text-violet-200"
                        : "text-zinc-500"
                    }`}
                  >
                    {pos}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <Link
                    href={`/clubes/${club.id}`}
                    className="flex items-center gap-3 hover:text-violet-300"
                  >
                    <ClubCrest club={club} size="md" />
                    <span className="font-bold uppercase tracking-wide text-white">
                      {club.name}
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-4 text-center text-lg font-black text-violet-300">
                  {row.points}
                </td>
                <td className="px-3 py-4 text-center text-zinc-400">{row.played}</td>
                <td className="px-3 py-4 text-center text-emerald-400/90">{row.won}</td>
                <td className="px-3 py-4 text-center text-zinc-400">{row.drawn}</td>
                <td className="px-3 py-4 text-center text-rose-400/90">{row.lost}</td>
                <td className="px-3 py-4 text-center text-zinc-300">{row.goalsFor}</td>
                <td className="px-3 py-4 text-center text-zinc-300">{row.goalsAgainst}</td>
                <td className="px-3 py-4 text-center font-medium text-zinc-300">
                  {row.goalDifference > 0 ? "+" : ""}
                  {row.goalDifference}
                </td>
                <td className="px-3 py-4 text-center text-sm text-zinc-500">
                  {winPct(row)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
