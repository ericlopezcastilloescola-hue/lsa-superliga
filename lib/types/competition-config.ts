export type CalendarMode = "manual" | "auto";

/** @deprecated — migrado a `phases` */
export type BaseCompetitionFormat =
  | "liga"
  | "eliminatoria"
  | "grupos_eliminatoria";

export type PhaseType = "tabla" | "llaves";

export type TableMode = "liga" | "grupos";

export type EliminationMode = "directa" | "doble";

export interface CompetitionPhase {
  name: string;
  type: PhaseType;
  /** Tabla: liga única o varios grupos */
  tableMode?: TableMode;
  /** Tabla grupos: nº de grupos (ej. 4) */
  groupsCount?: number;
  /** Tabla grupos: equipos por grupo (0 = reparto automático) */
  teamsPerGroup?: number;
  /** Tabla: ida y vuelta */
  homeAndAway?: boolean;
  /** Tabla: nº de rondas (0 = automático según equipos) */
  roundCount?: number;
  /** Llaves: eliminación directa o doble */
  eliminationMode?: EliminationMode;
  /** Llaves: equipos en el cuadro (0 = todos los inscritos) */
  bracketTeams?: number;
  /** Llaves: partidos por serie (1 = partido único, 2 = ida/vuelta…) */
  matchesPerSeries?: number;
}

export interface CompetitionConfig {
  calendarMode: CalendarMode;
  phases: CompetitionPhase[];
  /** @deprecated */
  baseFormat?: BaseCompetitionFormat;
  formatId?: string;
  maxTeams?: number;
  homeAndAway?: boolean;
  groupsCount?: number;
  teamsPerGroup?: number;
  qualifiersPerGroup?: number;
  knockoutTeams?: number;
  standingsEnabled: boolean;
}

export const DEFAULT_PHASE: CompetitionPhase = {
  name: "Fase 1",
  type: "tabla",
  tableMode: "liga",
  homeAndAway: false,
};

export const DEFAULT_COMPETITION_CONFIG: CompetitionConfig = {
  calendarMode: "auto",
  phases: [DEFAULT_PHASE],
  standingsEnabled: true,
};

function migrateLegacyConfig(parsed: Partial<CompetitionConfig>): CompetitionPhase[] {
  if (parsed.phases?.length) return parsed.phases;

  const base = parsed.baseFormat ?? "liga";
  if (base === "eliminatoria") {
    return [
      {
        name: "Eliminatoria",
        type: "llaves",
        eliminationMode: "directa",
        bracketTeams: 0,
        matchesPerSeries: parsed.homeAndAway ? 2 : 1,
      },
    ];
  }
  if (base === "grupos_eliminatoria") {
    return [
      {
        name: "Fase de grupos",
        type: "tabla",
        homeAndAway: false,
      },
      {
        name: "Eliminatoria",
        type: "llaves",
        eliminationMode: "directa",
        bracketTeams: parsed.knockoutTeams ?? 0,
        matchesPerSeries: parsed.homeAndAway ? 2 : 1,
      },
    ];
  }
  return [
    {
      name: "Liga",
      type: "tabla",
      homeAndAway: parsed.homeAndAway ?? false,
    },
  ];
}

export function parseCompetitionConfig(json: string): CompetitionConfig {
  try {
    const parsed = JSON.parse(json) as Partial<CompetitionConfig>;
    const phases = migrateLegacyConfig(parsed);
    return {
      ...DEFAULT_COMPETITION_CONFIG,
      ...parsed,
      phases,
      calendarMode: parsed.calendarMode ?? "auto",
      standingsEnabled: parsed.standingsEnabled ?? true,
    };
  } catch {
    return DEFAULT_COMPETITION_CONFIG;
  }
}

export function serializeCompetitionConfig(config: CompetitionConfig): string {
  return JSON.stringify(config);
}

export function resolveCompetitionType(
  config: CompetitionConfig,
): "liga" | "ida_vuelta" | "eliminatoria_directa" | "grupos_eliminatoria" {
  const phases = config.phases ?? [];
  const hasTabla = phases.some((p) => p.type === "tabla");
  const hasLlaves = phases.some((p) => p.type === "llaves");
  const homeAndAway = phases.some(
    (p) => p.type === "tabla" && p.homeAndAway,
  );

  if (hasTabla && hasLlaves) return "grupos_eliminatoria";
  if (hasLlaves) return "eliminatoria_directa";
  return homeAndAway ? "ida_vuelta" : "liga";
}
