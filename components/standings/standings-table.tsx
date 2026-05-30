"use client";

import Link from "next/link";
import { ClubCrest } from "@/components/clubs/club-crest";
import type { AppData, StandingRow } from "@/lib/types";
import { getClub } from "@/lib/utils/stats";

export function StandingsTable({
  rows,
  data,
  compact = false,
}: {
  rows: StandingRow[];
  data: AppData;
  compact?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-zinc-500">
            <th className="pb-3 pr-2">#</th>
            <th className="pb-3">Club</th>
            {!compact && (
              <>
                <th className="pb-3 text-center">PJ</th>
                <th className="pb-3 text-center">G</th>
                <th className="pb-3 text-center">E</th>
                <th className="pb-3 text-center">P</th>
              </>
            )}
            <th className="hidden pb-3 text-center sm:table-cell">GF</th>
            <th className="hidden pb-3 text-center sm:table-cell">GC</th>
            <th className="pb-3 text-center">DG</th>
            <th className="pb-3 text-center font-semibold text-cyan-400">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const club = getClub(data, row.clubId);
            if (!club) return null;
            const pos = i + 1;
            const highlight =
              pos <= 2 ? "text-cyan-400" : pos >= rows.length ? "text-rose-400/80" : "";

            return (
              <tr
                key={row.clubId}
                className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
              >
                <td className={`py-3 pr-2 font-mono ${highlight}`}>{pos}</td>
                <td className="py-3">
                  <Link
                    href={`/clubes/${club.id}`}
                    className="flex items-center gap-3 hover:text-cyan-400"
                  >
                    <ClubCrest club={club} size="sm" />
                    <span className="max-w-[7rem] truncate font-medium sm:max-w-none">
                      {club.name}
                    </span>
                  </Link>
                </td>
                {!compact && (
                  <>
                    <td className="py-3 text-center text-zinc-400">{row.played}</td>
                    <td className="py-3 text-center text-zinc-400">{row.won}</td>
                    <td className="py-3 text-center text-zinc-400">{row.drawn}</td>
                    <td className="py-3 text-center text-zinc-400">{row.lost}</td>
                  </>
                )}
                <td className="hidden py-3 text-center text-zinc-400 sm:table-cell">{row.goalsFor}</td>
                <td className="hidden py-3 text-center text-zinc-400 sm:table-cell">{row.goalsAgainst}</td>
                <td className="py-3 text-center text-zinc-400">
                  {row.goalDifference > 0 ? "+" : ""}
                  {row.goalDifference}
                </td>
                <td className="py-3 text-center font-bold text-white">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
