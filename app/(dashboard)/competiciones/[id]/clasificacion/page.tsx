"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CompetitionNav } from "@/components/competitions/competition-nav";
import { TournamentStandingsTable } from "@/components/standings/tournament-standings-table";
import { StandingsTable } from "@/components/standings/standings-table";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { useAppData } from "@/lib/store/data-context";
import {
  getCompetitionGroupLabels,
  usesGroupTables,
} from "@/lib/utils/competition-calendar";
import { clubsInGroup } from "@/lib/utils/group-split";
import { computeStandings, getCompetition } from "@/lib/utils/stats";

export default function ClasificacionPage() {
  const { id } = useParams<{ id: string }>();
  const data = useAppData();
  const comp = getCompetition(data, id);
  const [groupIndex, setGroupIndex] = useState(0);

  const groupLabels = useMemo(
    () => (comp ? getCompetitionGroupLabels(comp.clubIds, comp.config) : []),
    [comp],
  );
  const hasGroups = comp && usesGroupTables(comp.config) && groupLabels.length > 0;
  const groupsPhase = comp?.config?.phases?.find(
    (p) => p.type === "tabla" && p.tableMode === "grupos",
  );

  const standings = useMemo(() => {
    if (!comp) return [];
    if (!hasGroups) return computeStandings(data, id);
    const label = groupLabels[groupIndex];
    const ids = groupsPhase
      ? clubsInGroup(
          comp.clubIds,
          groupsPhase.groupsCount ?? 2,
          groupsPhase.teamsPerGroup ?? 0,
          groupIndex,
        )
      : comp.clubIds;
    return computeStandings(data, id, { groupLabel: label, clubIds: ids });
  }, [comp, data, id, hasGroups, groupLabels, groupIndex, groupsPhase]);

  if (!comp) return null;

  return (
    <div>
      <PageHeader
        title={`Clasificación — ${comp.name}`}
        description="Victoria +3 pts · Empate +1 pt · Derrota 0 pts"
      />

      <CompetitionNav comp={comp} id={id} />

      <Card glow>
        <CardBody>
          {hasGroups && (
            <div className="mb-6 flex flex-wrap gap-2">
              {groupLabels.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setGroupIndex(i)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
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
          {hasGroups ? (
            <TournamentStandingsTable
              rows={standings}
              data={data}
              groupName={groupLabels[groupIndex]}
            />
          ) : (
            <StandingsTable rows={standings} data={data} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
