"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { MENSAJES } from "@/lib/i18n/es";
import type { AppData, Match, MatchEvent } from "@/lib/types";
import { getClub } from "@/lib/utils/stats";

type Props = {
  match: Match;
  data: AppData;
  onSave: (result: {
    homeScore: number;
    awayScore: number;
    scorers: MatchEvent[];
    assists: MatchEvent[];
    mvpPlayerId: string | null;
  }) => Promise<string | null>;
};

export function MatchResultForm({ match, data, onSave }: Props) {
  const home = getClub(data, match.homeClubId)!;
  const away = getClub(data, match.awayClubId)!;
  const homeSquad = data.players.filter((p) => p.clubId === home.id);
  const awaySquad = data.players.filter((p) => p.clubId === away.id);

  const [homeScore, setHomeScore] = useState(String(match.homeScore ?? ""));
  const [awayScore, setAwayScore] = useState(String(match.awayScore ?? ""));
  const [scorers, setScorers] = useState<MatchEvent[]>(match.scorers);
  const [assists, setAssists] = useState<MatchEvent[]>(match.assists);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setHomeScore(String(match.homeScore ?? ""));
    setAwayScore(String(match.awayScore ?? ""));
    setScorers(match.scorers);
    setAssists(match.assists);
    setError(null);
  }, [match.id]);

  function addScorer(club: "home" | "away") {
    const squad = club === "home" ? homeSquad : awaySquad;
    const first = squad[0]?.id;
    if (!first) return;
    setScorers([...scorers, { playerId: first, minute: 0 }]);
  }

  function addAssist(club: "home" | "away") {
    const squad = club === "home" ? homeSquad : awaySquad;
    const first = squad[0]?.id;
    if (!first) return;
    setAssists([...assists, { playerId: first, minute: 0 }]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const hs = Number(homeScore);
    const as = Number(awayScore);

    if (Number.isNaN(hs) || Number.isNaN(as) || hs < 0 || as < 0) {
      setError(MENSAJES.errorMarcador);
      return;
    }

    const err = await onSave({
      homeScore: hs,
      awayScore: as,
      scorers,
      assists,
      mvpPlayerId: null,
    });
    if (err) {
      setError(err);
      return;
    }
    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={`Goles ${home.name}`}
          type="number"
          min={0}
          value={homeScore}
          onChange={(e) => setHomeScore(e.target.value)}
          required
        />
        <Input
          label={`Goles ${away.name}`}
          type="number"
          min={0}
          value={awayScore}
          onChange={(e) => setAwayScore(e.target.value)}
          required
        />
      </div>

      <p className="text-xs text-zinc-500">
        Sistema de puntos: victoria +3 · empate +1 · derrota 0. Goleadores y
        asistencias son opcionales.
      </p>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">
            Goleadores <span className="font-normal text-zinc-500">(opcional)</span>
          </h3>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => addScorer("home")}
              disabled={homeSquad.length === 0}
            >
              + Gol local
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => addScorer("away")}
              disabled={awaySquad.length === 0}
            >
              + Gol visitante
            </Button>
          </div>
        </div>
        {scorers.length === 0 ? (
          <p className="text-sm text-zinc-500">{MENSAJES.sinGoleadores}</p>
        ) : (
          <ul className="space-y-2">
            {scorers.map((s, i) => (
              <li
                key={`${s.playerId}-${i}`}
                className="flex flex-wrap items-end gap-2 rounded-lg border border-white/10 bg-black/20 p-3"
              >
                <Select
                  label="Jugador"
                  value={s.playerId}
                  onChange={(e) =>
                    setScorers(
                      scorers.map((x, j) =>
                        j === i ? { ...x, playerId: e.target.value } : x,
                      ),
                    )
                  }
                  className="min-w-[160px] flex-1"
                >
                  <optgroup label={home.name}>
                    {homeSquad.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.gamertag}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={away.name}>
                    {awaySquad.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.gamertag}
                      </option>
                    ))}
                  </optgroup>
                </Select>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setScorers(scorers.filter((_, j) => j !== i))}
                >
                  Quitar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">
            Asistencias <span className="font-normal text-zinc-500">(opcional)</span>
          </h3>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => addAssist("home")}
              disabled={homeSquad.length === 0}
            >
              + Asist. local
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => addAssist("away")}
              disabled={awaySquad.length === 0}
            >
              + Asist. visitante
            </Button>
          </div>
        </div>
        {assists.length === 0 ? (
          <p className="text-sm text-zinc-500">{MENSAJES.sinAsistencias}</p>
        ) : (
          <ul className="space-y-2">
            {assists.map((a, i) => (
              <li
                key={`${a.playerId}-${i}`}
                className="flex flex-wrap items-end gap-2 rounded-lg border border-white/10 bg-black/20 p-3"
              >
                <Select
                  label="Jugador"
                  value={a.playerId}
                  onChange={(e) =>
                    setAssists(
                      assists.map((x, j) =>
                        j === i ? { ...x, playerId: e.target.value } : x,
                      ),
                    )
                  }
                  className="min-w-[160px] flex-1"
                >
                  <optgroup label={home.name}>
                    {homeSquad.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.gamertag}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={away.name}>
                    {awaySquad.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.gamertag}
                      </option>
                    ))}
                  </optgroup>
                </Select>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setAssists(assists.filter((_, j) => j !== i))}
                >
                  Quitar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {MENSAJES.resultadoGuardado} La clasificación y estadísticas se han actualizado.
        </p>
      )}

      <Button type="submit">
        {match.status === "finished" ? "Actualizar resultado" : "Guardar resultado"}
      </Button>
    </form>
  );
}
