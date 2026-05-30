"use client";

import { useEffect, useMemo, useState } from "react";
import { ClubCrest } from "@/components/clubs/club-crest";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import type { AppData, Match, MatchEvent, Player } from "@/lib/types";
import { getClub } from "@/lib/utils/stats";

type TimelineEvent =
  | { id: string; type: "goal"; playerId: string; clubId: string; minute: number }
  | { id: string; type: "assist"; playerId: string; clubId: string; minute: number };

type Props = {
  match: Match;
  data: AppData;
  roundLabel?: string;
  saveLabel?: string;
  savedMessage?: string;
  onSave: (result: {
    homeScore: number;
    awayScore: number;
    scorers: MatchEvent[];
    assists: MatchEvent[];
    mvpPlayerId: string | null;
  }) => Promise<string | null>;
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function eventsFromMatch(
  match: Match,
  homeClubId: string,
  awayClubId: string,
  data: AppData,
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  for (const s of match.scorers) {
    const p = data.players.find((x) => x.id === s.playerId);
    events.push({
      id: uid(),
      type: "goal",
      playerId: s.playerId,
      clubId: p?.clubId ?? homeClubId,
      minute: s.minute || 0,
    });
  }
  for (const a of match.assists) {
    const p = data.players.find((x) => x.id === a.playerId);
    events.push({
      id: uid(),
      type: "assist",
      playerId: a.playerId,
      clubId: p?.clubId ?? homeClubId,
      minute: a.minute || 0,
    });
  }
  return events.sort((a, b) => a.minute - b.minute);
}

function buildPayload(
  events: TimelineEvent[],
  homeClubId: string,
): {
  homeScore: number;
  awayScore: number;
  scorers: MatchEvent[];
  assists: MatchEvent[];
} {
  const scorers: MatchEvent[] = [];
  const assists: MatchEvent[] = [];
  let homeScore = 0;
  let awayScore = 0;

  for (const e of events) {
    if (e.type === "goal") {
      scorers.push({ playerId: e.playerId, minute: e.minute || scorers.length + 1 });
      if (e.clubId === homeClubId) homeScore++;
      else awayScore++;
    } else {
      assists.push({ playerId: e.playerId, minute: e.minute || assists.length + 1 });
    }
  }

  return { homeScore, awayScore, scorers, assists };
}

export function MatchEditor({
  match,
  data,
  roundLabel,
  saveLabel = "Guardar partido",
  savedMessage = "Partido guardado. Clasificación y stats actualizados.",
  onSave,
}: Props) {
  const home = getClub(data, match.homeClubId)!;
  const away = getClub(data, match.awayClubId)!;

  const homeSquad = useMemo(
    () => data.players.filter((p) => p.clubId === home.id),
    [data.players, home.id],
  );
  const awaySquad = useMemo(
    () => data.players.filter((p) => p.clubId === away.id),
    [data.players, away.id],
  );

  const [events, setEvents] = useState<TimelineEvent[]>(() =>
    eventsFromMatch(match, home.id, away.id, data),
  );
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventType, setEventType] = useState<"goal" | "assist" | null>(null);
  const [pickClub, setPickClub] = useState<"home" | "away">("home");
  const [pickPlayer, setPickPlayer] = useState("");
  const [manualHome, setManualHome] = useState<string | null>(null);
  const [manualAway, setManualAway] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const computed = useMemo(() => buildPayload(events, home.id), [events, home.id]);
  const homeScore = manualHome !== null ? Number(manualHome) : computed.homeScore;
  const awayScore = manualAway !== null ? Number(manualAway) : computed.awayScore;

  useEffect(() => {
    setEvents(eventsFromMatch(match, home.id, away.id, data));
    setManualHome(null);
    setManualAway(null);
    setError(null);
    setSaved(false);
  }, [match.id, match.homeScore, match.awayScore, match.scorers, match.assists]);

  function squadFor(club: "home" | "away"): Player[] {
    return club === "home" ? homeSquad : awaySquad;
  }

  function addEvent() {
    if (!pickPlayer || !eventType) return;
    const clubId = pickClub === "home" ? home.id : away.id;
    const minute = events.length + 1;
    setEvents([
      ...events,
      {
        id: uid(),
        type: eventType === "goal" ? "goal" : "assist",
        playerId: pickPlayer,
        clubId,
        minute,
      },
    ]);
    setManualHome(null);
    setManualAway(null);
    setShowAddEvent(false);
    setEventType(null);
    setPickPlayer("");
  }

  function removeEvent(id: string) {
    setEvents(events.filter((e) => e.id !== id));
    setManualHome(null);
    setManualAway(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const hs = Number.isNaN(homeScore) ? 0 : homeScore;
    const as = Number.isNaN(awayScore) ? 0 : awayScore;

    const err = await onSave({
      homeScore: hs,
      awayScore: as,
      scorers: computed.scorers,
      assists: computed.assists,
      mvpPlayerId: null,
    });

    setSaving(false);
    if (err) {
      setError(err);
    } else {
      setSaved(true);
      setManualHome(null);
      setManualAway(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-b from-[#141820] via-[#0f1219] to-[#0a0c12] shadow-[0_0_80px_-20px_rgba(139,92,246,0.35)]">
      {/* Cabecera */}
      <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-transparent to-rose-500/10 px-8 py-5 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
          {roundLabel ?? "Partido"}
        </p>
      </div>

      {/* Marcador */}
      <div className="grid grid-cols-1 items-center gap-8 px-6 py-12 md:grid-cols-[1fr_auto_1fr] md:px-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <ClubCrest club={home} size="lg" />
          <div>
            <p className="text-xl font-black uppercase tracking-wide text-white md:text-2xl">
              {home.name}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
              Anfitrión
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-6 py-4 shadow-inner">
            <input
              type="number"
              min={0}
              value={homeScore}
              onChange={(e) => setManualHome(e.target.value)}
              className="w-16 bg-transparent text-center font-mono text-5xl font-black text-rose-400 outline-none md:w-20 md:text-6xl"
            />
            <span className="text-3xl font-light text-zinc-600">:</span>
            <input
              type="number"
              min={0}
              value={awayScore}
              onChange={(e) => setManualAway(e.target.value)}
              className="w-16 bg-transparent text-center font-mono text-5xl font-black text-rose-400 outline-none md:w-20 md:text-6xl"
            />
          </div>
          <p className="text-xs text-zinc-500">Marcador · editable</p>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <ClubCrest club={away} size="lg" />
          <div>
            <p className="text-xl font-black uppercase tracking-wide text-white md:text-2xl">
              {away.name}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400/80">
              Visitante
            </p>
          </div>
        </div>
      </div>

      {/* Línea de tiempo */}
      <div className="border-t border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 px-8 py-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-white">
            Línea de tiempo
          </h3>
          {!showAddEvent && (
            <Button
              type="button"
              className="bg-rose-600 hover:bg-rose-500"
              onClick={() => setShowAddEvent(true)}
            >
              + Añadir evento
            </Button>
          )}
        </div>

        <div className="px-6 py-8 md:px-10">
          {showAddEvent && !eventType && (
            <div className="mb-8">
              <p className="mb-5 text-center text-sm text-zinc-400">
                Selecciona el tipo de evento
              </p>
              <div className="mx-auto grid max-w-lg grid-cols-2 gap-4">
                {[
                  {
                    id: "goal" as const,
                    label: "Gol",
                    icon: "⚽",
                    accent: "hover:border-emerald-500/50 hover:bg-emerald-500/10",
                  },
                  {
                    id: "assist" as const,
                    label: "Asistencia",
                    icon: "🅰️",
                    accent: "hover:border-cyan-500/50 hover:bg-cyan-500/10",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEventType(opt.id)}
                    className={`flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-8 transition-all ${opt.accent}`}
                  >
                    <span className="text-4xl">{opt.icon}</span>
                    <span className="text-base font-bold text-white">{opt.label}</span>
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                className="mx-auto mt-5 block"
                onClick={() => setShowAddEvent(false)}
              >
                Cancelar
              </Button>
            </div>
          )}

          {showAddEvent && eventType && (
            <div className="mx-auto mb-8 max-w-md space-y-5 rounded-2xl border border-white/10 bg-black/30 p-6">
              <p className="text-center text-sm font-bold text-white">
                {eventType === "goal" ? "⚽ Gol" : "🅰️ Asistencia"} — elegir jugador
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPickClub("home");
                    setPickPlayer("");
                  }}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors ${
                    pickClub === "home"
                      ? "bg-violet-500/25 text-violet-200 ring-1 ring-violet-500/40"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10"
                  }`}
                >
                  {home.tag}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPickClub("away");
                    setPickPlayer("");
                  }}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors ${
                    pickClub === "away"
                      ? "bg-rose-500/25 text-rose-200 ring-1 ring-rose-500/40"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10"
                  }`}
                >
                  {away.tag}
                </button>
              </div>
              {squadFor(pickClub).length === 0 ? (
                <p className="text-sm text-amber-400">
                  Este equipo no tiene jugadores. Añade jugadores al club o usa
                  solo el marcador.
                </p>
              ) : (
                <Select
                  label="Jugador"
                  value={pickPlayer}
                  onChange={(e) => setPickPlayer(e.target.value)}
                >
                  <option value="">— Elegir —</option>
                  {squadFor(pickClub).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.gamertag}
                    </option>
                  ))}
                </Select>
              )}
              <div className="flex gap-2">
                <Button type="button" onClick={addEvent} disabled={!pickPlayer}>
                  Añadir
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEventType(null);
                    setPickPlayer("");
                  }}
                >
                  Atrás
                </Button>
              </div>
            </div>
          )}

          <div className="relative mx-auto max-w-2xl space-y-3">
            {events.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
                <p className="text-sm text-zinc-500">
                  Sin eventos. Añade goles y asistencias o edita el marcador.
                </p>
              </div>
            ) : (
              events.map((e, idx) => {
                const player = data.players.find((p) => p.id === e.playerId);
                const club = getClub(data, e.clubId);
                const isGoal = e.type === "goal";
                return (
                  <div key={e.id} className="relative flex gap-4 pl-2">
                    {idx < events.length - 1 && (
                      <div className="absolute left-[1.15rem] top-12 h-[calc(100%+0.5rem)] w-px bg-white/10" />
                    )}
                    <div
                      className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isGoal
                          ? "bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500/30"
                          : "bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/30"
                      }`}
                    >
                      {isGoal ? "⚽" : "A"}
                    </div>
                    <div
                      className={`flex flex-1 items-center justify-between rounded-xl border px-5 py-4 ${
                        isGoal
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : "border-cyan-500/20 bg-cyan-500/5"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-white">
                          {player?.gamertag ?? "Jugador"}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {isGoal ? "Gol" : "Asistencia"} · {club?.tag}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEvent(e.id)}
                        className="rounded-lg px-3 py-1.5 text-xs text-rose-400 transition-colors hover:bg-rose-500/10"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 bg-black/30 px-6 py-6 md:px-10">
        {error && (
          <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </p>
        )}
        {saved && (
          <p className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {savedMessage}
          </p>
        )}
        <Button
          type="button"
          className="w-full py-4 text-base font-bold"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Guardando…" : saveLabel}
        </Button>
      </div>
    </div>
  );
}
