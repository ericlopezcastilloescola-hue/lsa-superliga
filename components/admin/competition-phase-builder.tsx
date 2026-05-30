"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  CompetitionPhase,
  EliminationMode,
  PhaseType,
  TableMode,
} from "@/lib/types/competition-config";

type Props = {
  phases: CompetitionPhase[];
  onChange: (phases: CompetitionPhase[]) => void;
};

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-zinc-400">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-lg text-zinc-300 hover:bg-white/5"
        >
          −
        </button>
        <span className="min-w-[3rem] text-center text-lg font-semibold text-white">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(max ? Math.min(max, value + 1) : value + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-lg text-zinc-300 hover:bg-white/5"
        >
          +
        </button>
      </div>
    </div>
  );
}

function PhaseCard({
  phase,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  phase: CompetitionPhase;
  index: number;
  onUpdate: (p: CompetitionPhase) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const tableMode = phase.tableMode ?? "liga";

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
          Fase {index + 1}
        </p>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-rose-400 hover:text-rose-300"
          >
            Eliminar fase
          </button>
        )}
      </div>

      <Input
        label="Nombre de la fase"
        value={phase.name}
        onChange={(e) => onUpdate({ ...phase, name: e.target.value })}
        placeholder="Fase 1"
      />

      <div>
        <p className="mb-2 text-sm text-zinc-400">Tipo de fase</p>
        <div className="flex flex-wrap gap-4">
          {(
            [
              { id: "tabla", label: "Tabla" },
              { id: "llaves", label: "Llaves" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-2 text-sm text-zinc-200"
            >
              <input
                type="radio"
                name={`phase-type-${index}`}
                checked={phase.type === opt.id}
                onChange={() =>
                  onUpdate({
                    ...phase,
                    type: opt.id as PhaseType,
                  })
                }
                className="accent-violet-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {phase.type === "tabla" && (
        <>
          <div>
            <p className="mb-2 text-sm text-zinc-400">Formato de tabla</p>
            <div className="flex flex-wrap gap-4">
              {(
                [
                  { id: "liga", label: "Liga (una tabla)" },
                  { id: "grupos", label: "Varios grupos" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center gap-2 text-sm text-zinc-200"
                >
                  <input
                    type="radio"
                    name={`table-mode-${index}`}
                    checked={tableMode === opt.id}
                    onChange={() =>
                      onUpdate({
                        ...phase,
                        tableMode: opt.id as TableMode,
                      })
                    }
                    className="accent-violet-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {tableMode === "grupos" && (
            <div className="grid gap-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 sm:grid-cols-2">
              <Stepper
                label="Número de grupos"
                value={phase.groupsCount ?? 4}
                min={2}
                max={16}
                onChange={(v) => onUpdate({ ...phase, groupsCount: v })}
              />
              <Stepper
                label="Equipos por grupo (0 = reparto auto)"
                value={phase.teamsPerGroup ?? 0}
                min={0}
                max={32}
                onChange={(v) => onUpdate({ ...phase, teamsPerGroup: v })}
              />
              <p className="sm:col-span-2 text-xs text-zinc-500">
                Ejemplo: 4 grupos × 4 equipos = 16 equipos. Con 0 equipos/grupo
                se reparten equitativamente entre los grupos.
              </p>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={phase.homeAndAway ?? false}
              onChange={(e) =>
                onUpdate({ ...phase, homeAndAway: e.target.checked })
              }
              className="rounded accent-violet-500"
            />
            Ida y vuelta
          </label>
          <Stepper
            label="Número de rondas (0 = automático, round-robin completo)"
            value={phase.roundCount ?? 0}
            min={0}
            onChange={(v) => onUpdate({ ...phase, roundCount: v })}
          />
          <p className="text-xs text-zinc-500">
            0 = todas las jornadas del round-robin. Con grupos, cada grupo juega
            sus rondas en paralelo (Ronda 1 = todos los grupos, etc.).
          </p>
        </>
      )}

      {phase.type === "llaves" && (
        <div className="space-y-4 rounded-lg border border-white/5 p-4">
          <div>
            <p className="mb-2 text-sm text-zinc-400">Eliminación</p>
            <div className="flex flex-wrap gap-4">
              {(
                [
                  { id: "directa", label: "Eliminación directa" },
                  { id: "doble", label: "Eliminación doble" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center gap-2 text-sm text-zinc-200"
                >
                  <input
                    type="radio"
                    name={`elim-${index}`}
                    checked={(phase.eliminationMode ?? "directa") === opt.id}
                    onChange={() =>
                      onUpdate({
                        ...phase,
                        eliminationMode: opt.id as EliminationMode,
                      })
                    }
                    className="accent-violet-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Stepper
              label="Número de competidores en la llave (0 = todos)"
              value={phase.bracketTeams ?? 0}
              min={0}
              onChange={(v) => onUpdate({ ...phase, bracketTeams: v })}
            />
            <Stepper
              label="Partidos por la serie"
              value={phase.matchesPerSeries ?? 1}
              min={1}
              max={3}
              onChange={(v) => onUpdate({ ...phase, matchesPerSeries: v })}
            />
          </div>
          <p className="text-xs text-zinc-500">
            0 equipos = todos los inscritos. Partidos por serie: 1 = partido
            único, 2 = ida y vuelta.
          </p>
        </div>
      )}
    </div>
  );
}

export function CompetitionPhaseBuilder({ phases, onChange }: Props) {
  function updatePhase(i: number, p: CompetitionPhase) {
    onChange(phases.map((ph, idx) => (idx === i ? p : ph)));
  }

  function addPhase() {
    onChange([
      ...phases,
      {
        name: `Fase ${phases.length + 1}`,
        type: "tabla",
        tableMode: "liga",
        homeAndAway: false,
      },
    ]);
  }

  return (
    <div className="space-y-4">
      {phases.map((phase, i) => (
        <PhaseCard
          key={i}
          phase={phase}
          index={i}
          onUpdate={(p) => updatePhase(i, p)}
          onRemove={() => onChange(phases.filter((_, idx) => idx !== i))}
          canRemove={phases.length > 1}
        />
      ))}
      <Button type="button" variant="secondary" onClick={addPhase}>
        + Añadir fase
      </Button>
    </div>
  );
}
