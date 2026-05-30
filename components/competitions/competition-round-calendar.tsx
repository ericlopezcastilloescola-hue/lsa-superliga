"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClubCrest } from "@/components/clubs/club-crest";
import { TournamentStandingsTable } from "@/components/standings/tournament-standings-table";
import { GenerateCalendarButton } from "@/components/competitions/generate-calendar-button";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { KebabMenu } from "@/components/ui/kebab-menu";
import type { Competition } from "@/lib/types";
import type { CompetitionConfig } from "@/lib/types/competition-config";
import { clubsInGroup } from "@/lib/utils/group-split";
import { getCompetitionGroupLabels, usesGroupTables } from "@/lib/utils/competition-calendar";
import { useAppData, useData } from "@/lib/store/data-context";
import { useAuth } from "@/lib/store/auth-context";
import { useConfirm } from "@/lib/store/confirm-context";
import { computeStandings, getClub, getCompetitionMatches } from "@/lib/utils/stats";

function roundLabel(name: string, index: number): string {
  const cleaned = name.replace(/^.*?—\s*/, "").trim();
  return cleaned || `Ronda ${index + 1}`;
}

export function CompetitionRoundCalendar({
  comp,
  hideStandings = false,
}: {
  comp: Competition;
  hideStandings?: boolean;
}) {
  const data = useAppData();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const { askConfirm, askPrompt } = useConfirm();
  const {
    createMatchday,
    updateMatchday,
    deleteMatchday,
    deleteMatchdayMatches,
    deleteCompetitionMatch,
    createCompetitionMatch,
  } = useData();

  const [roundIndex, setRoundIndex] = useState(0);
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [groupIndex, setGroupIndex] = useState(0);

  const groupLabels = useMemo(
    () => getCompetitionGroupLabels(comp.clubIds, comp.config),
    [comp.clubIds, comp.config],
  );
  const hasGroups = usesGroupTables(comp.config) && groupLabels.length > 0;

  const groupsPhase = comp.config?.phases?.find(
    (p) => p.type === "tabla" && p.tableMode === "grupos",
  );

  const standings = useMemo(() => {
    if (!hasGroups) return computeStandings(data, comp.id);
    const label = groupLabels[groupIndex];
    const ids = groupsPhase
      ? clubsInGroup(
          comp.clubIds,
          groupsPhase.groupsCount ?? 2,
          groupsPhase.teamsPerGroup ?? 0,
          groupIndex,
        )
      : comp.clubIds;
    return computeStandings(data, comp.id, { groupLabel: label, clubIds: ids });
  }, [data, comp.id, comp.clubIds, hasGroups, groupLabels, groupIndex, groupsPhase]);

  const matchdays = useMemo(
    () =>
      data.matchdays
        .filter((md) => md.competitionId === comp.id)
        .sort((a, b) => a.number - b.number),
    [data.matchdays, comp.id],
  );

  const matches = useMemo(
    () =>
      getCompetitionMatches(data, comp.id).sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      ),
    [data, comp.id],
  );

  const clubsInComp = comp.clubIds
    .map((id) => getClub(data, id))
    .filter(Boolean);

  const currentRound = matchdays[roundIndex] ?? null;
  const roundMatches = currentRound
    ? matches.filter((m) => m.matchdayId === currentRound.id)
    : [];

  async function handleAddRound() {
    const n = matchdays.length + 1;
    const name = await askPrompt({
      title: "Añadir ronda",
      label: "Nombre de la ronda",
      defaultValue: `Ronda ${n}`,
    });
    if (!name) return;
    await createMatchday(comp.id, name, new Date().toISOString().slice(0, 10));
    setRoundIndex(matchdays.length);
  }

  async function handleRename() {
    if (!currentRound) return;
    const name = await askPrompt({
      title: "Renombrar ronda",
      label: "Nuevo nombre",
      defaultValue: currentRound.name,
    });
    if (!name) return;
    await updateMatchday(comp.id, currentRound.id, { name });
  }

  async function handleSetDate() {
    if (!currentRound) return;
    const date = await askPrompt({
      title: "Cambiar fecha",
      label: "Fecha (AAAA-MM-DD)",
      defaultValue: currentRound.startDate,
      inputType: "date",
    });
    if (!date) return;
    await updateMatchday(comp.id, currentRound.id, {
      startDate: date,
      applyDateToMatches: true,
    });
  }

  async function handleDeleteMatches() {
    if (!currentRound) return;
    const ok = await askConfirm({
      title: "Eliminar partidos",
      message: "¿Eliminar todos los partidos de esta ronda?",
    });
    if (!ok) return;
    await deleteMatchdayMatches(comp.id, currentRound.id);
  }

  async function handleDeleteRound() {
    if (!currentRound) return;
    const ok = await askConfirm({
      title: "Eliminar ronda",
      message: "¿Eliminar esta ronda y sus partidos?",
    });
    if (!ok) return;
    await deleteMatchday(comp.id, currentRound.id);
    setRoundIndex(Math.max(0, roundIndex - 1));
  }

  async function handleDeleteMatch(matchId: string) {
    const ok = await askConfirm({
      title: "Eliminar partido",
      message: "¿Eliminar este partido?",
    });
    if (!ok) return;
    await deleteCompetitionMatch(comp.id, matchId);
  }

  const calendarMenuItems = isAdmin
    ? [{ label: "Añadir ronda manualmente", onClick: handleAddRound }]
    : [];

  const roundMenuItems =
    isAdmin && currentRound
      ? [
          { label: "Cambiar el nombre de esta ronda", onClick: handleRename },
          {
            label: "Cambiar la fecha de todos los partidos de esta ronda",
            onClick: handleSetDate,
          },
          {
            label: "Eliminar todos los partidos de esta ronda",
            onClick: handleDeleteMatches,
            danger: true,
            dividerBefore: true,
          },
          ...(matchdays.length > 1
            ? [
                {
                  label: "Eliminar esta ronda",
                  onClick: handleDeleteRound,
                  danger: true,
                },
              ]
            : []),
        ]
      : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-[#12151c] via-[#0f1219] to-[#12101a] shadow-[0_0_60px_-12px_rgba(139,92,246,0.25)]">
      <div className="grid min-h-[560px] xl:grid-cols-2 xl:divide-x xl:divide-white/10">
        {!hideStandings && (
        <section className="flex min-w-0 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-transparent px-6 py-5">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Tabla de posiciones
              </h3>
              <p className="mt-1 text-xs text-zinc-500">3 pts · 1 pt · 0 pts</p>
            </div>
          </header>
          <div className="flex-1 px-4 py-6 sm:px-6">
            {hasGroups && (
              <div className="mb-4 flex flex-wrap gap-2">
                {groupLabels.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setGroupIndex(i)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      groupIndex === i
                        ? "bg-violet-500/25 text-violet-200"
                        : "bg-white/5 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {standings.length === 0 ? (
              <p className="py-16 text-center text-base text-zinc-500">
                Sin equipos inscritos.
              </p>
            ) : (
              <TournamentStandingsTable
                rows={standings}
                data={data}
                groupName={hasGroups ? groupLabels[groupIndex] : "Grupo 1"}
              />
            )}
          </div>
        </section>
        )}

        {/* Calendario */}
        <section
          className={`flex min-w-0 flex-col ${hideStandings ? "xl:col-span-2" : "border-t border-white/10 xl:border-t-0"}`}
        >
          <header className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-rose-500/10 to-transparent px-6 py-5">
            <h3 className="text-xl font-bold tracking-tight text-white">Calendario</h3>
            <div className="flex items-center gap-2">
              {isAdmin && <GenerateCalendarButton comp={comp} />}
              <KebabMenu
                items={calendarMenuItems}
                theme="dark"
                ariaLabel="Opciones del calendario"
              />
            </div>
          </header>

          {matchdays.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-20 text-center">
              <p className="max-w-sm text-base text-zinc-400">
                Genera el calendario automáticamente según los equipos inscritos y las
                fases de la competición.
              </p>
              {isAdmin && (
                <GenerateCalendarButton comp={comp} size="large" />
              )}
              {isAdmin && (
                <p className="text-xs text-zinc-500">
                  o usa el menú ⋮ para añadir rondas manualmente
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center border-b border-white/10 bg-black/20 px-4 py-3">
                <button
                  type="button"
                  disabled={roundIndex <= 0}
                  onClick={() => setRoundIndex(roundIndex - 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-2xl text-rose-400 transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 disabled:opacity-20"
                  aria-label="Ronda anterior"
                >
                  ‹
                </button>
                <div className="flex flex-1 flex-col items-center justify-center gap-1 py-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    {roundIndex + 1} / {matchdays.length}
                  </span>
                  <span className="text-2xl font-bold text-white">
                    {currentRound
                      ? roundLabel(currentRound.name, roundIndex)
                      : `Ronda ${roundIndex + 1}`}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={roundIndex >= matchdays.length - 1}
                  onClick={() => setRoundIndex(roundIndex + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-2xl text-rose-400 transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 disabled:opacity-20"
                  aria-label="Ronda siguiente"
                >
                  ›
                </button>
                <KebabMenu
                  items={roundMenuItems}
                  theme="dark"
                  ariaLabel="Opciones de la ronda"
                />
              </div>

              <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-2.5">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Sin fecha
                </span>
                {isAdmin && currentRound && (
                  <KebabMenu
                    theme="dark"
                    items={[
                      {
                        label: "Añadir partido a esta ronda",
                        onClick: () => setShowAddMatch(true),
                      },
                    ]}
                    ariaLabel="Opciones de partidos"
                  />
                )}
              </div>

              <div className="flex-1 divide-y divide-white/5">
                {roundMatches.length === 0 ? (
                  <p className="py-16 text-center text-base text-zinc-500">
                    Sin partidos en esta ronda.
                  </p>
                ) : (
                  roundMatches.map((m) => {
                    const home = getClub(data, m.homeClubId);
                    const away = getClub(data, m.awayClubId);
                    const finished = m.status === "finished";
                    return (
                      <div
                        key={m.id}
                        className="group flex items-center gap-2 px-4 py-4 transition-colors hover:bg-violet-500/[0.06] sm:px-6 sm:py-5"
                      >
                        <Link
                          href={`/partidos/${m.id}`}
                          className="flex min-w-0 flex-1 items-center"
                        >
                          <div className="flex flex-1 items-center justify-end gap-3 pr-3">
                            <span className="truncate text-base font-black uppercase tracking-wide text-white sm:text-lg">
                              {home?.tag ?? "—"}
                            </span>
                            {home && <ClubCrest club={home} size="xl" />}
                          </div>

                          <div className="flex shrink-0 flex-col items-center px-4">
                            {finished ? (
                              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 font-mono text-xl font-black text-rose-400 sm:text-2xl">
                                {m.homeScore} – {m.awayScore}
                              </div>
                            ) : (
                              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl text-zinc-400">
                                ⇄
                              </span>
                            )}
                          </div>

                          <div className="flex flex-1 items-center gap-3 pl-3">
                            {away && <ClubCrest club={away} size="xl" />}
                            <span className="truncate text-base font-black uppercase tracking-wide text-white sm:text-lg">
                              {away?.tag ?? "—"}
                            </span>
                          </div>
                        </Link>

                        {isAdmin && (
                          <KebabMenu
                            theme="dark"
                            items={[
                              {
                                label: "Editar partido / resultado",
                                onClick: () => router.push(`/partidos/${m.id}`),
                              },
                              {
                                label: "Eliminar partido",
                                onClick: () => handleDeleteMatch(m.id),
                                danger: true,
                                dividerBefore: true,
                              },
                            ]}
                            ariaLabel="Opciones del partido"
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {showAddMatch && currentRound && (
                <form
                  onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    await createCompetitionMatch(comp.id, {
                      matchdayId: currentRound.id,
                      homeClubId: String(fd.get("homeClubId")),
                      awayClubId: String(fd.get("awayClubId")),
                      scheduledAt: new Date(
                        String(fd.get("scheduledAt") || currentRound.startDate),
                      ).toISOString(),
                    });
                    setShowAddMatch(false);
                  }}
                  className="space-y-3 border-t border-white/10 bg-black/30 p-6"
                >
                  <Select label="Local" name="homeClubId" required>
                    <option value="">—</option>
                    {clubsInComp.map((c) => (
                      <option key={c!.id} value={c!.id}>
                        {c!.name}
                      </option>
                    ))}
                  </Select>
                  <Select label="Visitante" name="awayClubId" required>
                    <option value="">—</option>
                    {clubsInComp.map((c) => (
                      <option key={c!.id} value={c!.id}>
                        {c!.name}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label="Fecha y hora"
                    name="scheduledAt"
                    type="datetime-local"
                    defaultValue={`${currentRound.startDate}T20:00`}
                  />
                  <div className="flex gap-2">
                    <Button type="submit">Guardar partido</Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowAddMatch(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
