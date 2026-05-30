"use client";

import Link from "next/link";
import { ClubCrest } from "@/components/clubs/club-crest";
import type { AppData, Match } from "@/lib/types";
import { resolveBracketClubId } from "@/lib/utils/knockout-bracket";
import { getClub } from "@/lib/utils/stats";
import {
  groupKnockoutSeries,
  seriesAggregateScore,
  seriesIsPlayable,
  type KnockoutSeries,
} from "@/lib/utils/knockout-series";

function TbdRow({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 text-zinc-500">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-white/15 text-xs">
        ?
      </span>
      <span className="flex-1 text-sm italic">
        {label ?? "Por determinar"}
      </span>
      <span className="font-mono text-sm">–</span>
    </div>
  );
}

function TeamRow({
  clubId,
  data,
  score,
  highlight,
}: {
  clubId: string;
  data: AppData;
  score: number | null;
  highlight?: boolean;
}) {
  const club = getClub(data, clubId);
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 ${
        highlight ? "bg-violet-500/10" : ""
      }`}
    >
      {club && <ClubCrest club={club} size="sm" />}
      <span className="flex-1 truncate text-sm text-white">
        {club?.tag ?? club?.name ?? "—"}
      </span>
      <span className="font-mono text-sm text-rose-400">
        {score !== null ? score : "–"}
      </span>
    </div>
  );
}

function LegRow({
  match,
  data,
  matches,
  label,
  homeClubId,
  awayClubId,
  aggregateHomeId,
  invertAggregate,
}: {
  match: Match;
  data: AppData;
  matches: Match[];
  label: string;
  homeClubId: string | null;
  awayClubId: string | null;
  aggregateHomeId: string | null;
  invertAggregate?: boolean;
}) {
  const finished = match.status === "finished";
  const homeScore = finished ? (match.homeScore ?? 0) : null;
  const awayScore = finished ? (match.awayScore ?? 0) : null;
  const playable = homeClubId && awayClubId;

  const homeHighlight =
    finished &&
    aggregateHomeId &&
    (invertAggregate
      ? awayClubId === aggregateHomeId && (awayScore ?? 0) > (homeScore ?? 0)
      : homeClubId === aggregateHomeId && (homeScore ?? 0) > (awayScore ?? 0));

  const awayHighlight =
    finished &&
    aggregateHomeId &&
    (invertAggregate
      ? homeClubId === aggregateHomeId && (homeScore ?? 0) > (awayScore ?? 0)
      : awayClubId === aggregateHomeId && (awayScore ?? 0) > (homeScore ?? 0));

  const inner = (
    <>
      <div className="border-b border-white/10 px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="divide-y divide-white/5">
        {homeClubId ? (
          <TeamRow
            clubId={homeClubId}
            data={data}
            score={homeScore}
            highlight={!!homeHighlight}
          />
        ) : (
          <TbdRow />
        )}
        {awayClubId ? (
          <TeamRow
            clubId={awayClubId}
            data={data}
            score={awayScore}
            highlight={!!awayHighlight}
          />
        ) : (
          <TbdRow />
        )}
      </div>
    </>
  );

  if (!playable) {
    return <div className="opacity-90">{inner}</div>;
  }

  return (
    <Link
      href={`/partidos/${match.id}`}
      className="block transition-colors hover:bg-white/[0.03]"
    >
      {inner}
    </Link>
  );
}

function SeriesCard({
  series,
  data,
  matches,
  index,
}: {
  series: KnockoutSeries;
  data: AppData;
  matches: Match[];
  index: number;
}) {
  const agg = seriesAggregateScore(series, matches);
  const hasTwoLegs = !!series.vuelta;
  const playable = seriesIsPlayable(series, matches);

  const idaHome =
    resolveBracketClubId(series.ida, "home", matches) ?? agg.homeClubId;
  const idaAway =
    resolveBracketClubId(series.ida, "away", matches) ?? agg.awayClubId;

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-3 py-2">
        <span className="text-xs text-zinc-500">Serie {index + 1}</span>
        {hasTwoLegs && agg.decided && agg.homeTotal !== null && (
          <span className="font-mono text-xs text-rose-400">
            Global {agg.homeTotal} – {agg.awayTotal}
          </span>
        )}
        {!playable && (
          <span className="text-xs italic text-zinc-600">Pendiente</span>
        )}
      </div>

      {hasTwoLegs ? (
        <>
          <LegRow
            match={series.ida}
            data={data}
            matches={matches}
            label="Ida"
            homeClubId={idaHome}
            awayClubId={idaAway}
            aggregateHomeId={agg.homeClubId}
          />
          <LegRow
            match={series.vuelta!}
            data={data}
            matches={matches}
            label="Vuelta"
            homeClubId={idaAway}
            awayClubId={idaHome}
            aggregateHomeId={agg.homeClubId}
            invertAggregate
          />
        </>
      ) : playable ? (
        <Link
          href={`/partidos/${series.ida.id}`}
          className="block transition-colors hover:bg-white/[0.03]"
        >
          <div className="divide-y divide-white/5">
            {idaHome ? (
              <TeamRow
                clubId={idaHome}
                data={data}
                score={agg.decided ? agg.homeTotal : null}
                highlight={
                  agg.decided &&
                  (agg.homeTotal ?? 0) > (agg.awayTotal ?? 0)
                }
              />
            ) : (
              <TbdRow />
            )}
            {idaAway ? (
              <TeamRow
                clubId={idaAway}
                data={data}
                score={agg.decided ? agg.awayTotal : null}
                highlight={
                  agg.decided &&
                  (agg.awayTotal ?? 0) > (agg.homeTotal ?? 0)
                }
              />
            ) : (
              <TbdRow />
            )}
          </div>
        </Link>
      ) : (
        <div className="divide-y divide-white/5">
          <TbdRow />
          <TbdRow />
        </div>
      )}
    </div>
  );
}

export function KnockoutBracketView({
  data,
  competitionId,
}: {
  data: AppData;
  competitionId: string;
}) {
  const matches = data.matches.filter((m) => m.competitionId === competitionId);
  const rounds = data.knockoutRounds
    .filter((kr) => kr.competitionId === competitionId)
    .sort((a, b) => a.order - b.order);

  if (rounds.length === 0) return null;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-8">
        {rounds.map((round) => {
          const series = groupKnockoutSeries(round.matchIds, matches);
          return (
            <div key={round.id} className="w-80 shrink-0">
              <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-zinc-400">
                {round.name}
              </h3>
              <div className="space-y-4">
                {series.map((s, idx) => (
                  <SeriesCard
                    key={s.ida.id}
                    series={s}
                    data={data}
                    matches={matches}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
