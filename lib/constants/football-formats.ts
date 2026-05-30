import type { CompetitionConfig } from "@/lib/types/competition-config";

export type FootballFormatId =
  | "liga_regular"
  | "liga_ida_vuelta"
  | "liga_inglesa"
  | "liga_espanola"
  | "copa_eliminatoria"
  | "copa_ida_vuelta"
  | "supercopa"
  | "playoff_4"
  | "playoff_8"
  | "grupos_4_ko"
  | "grupos_6_ko"
  | "champions_32"
  | "champions_16"
  | "mundial_32"
  | "eurocopa_24"
  | "torneo_apertura"
  | "torneo_clausura";

export interface FootballFormatOption {
  id: FootballFormatId;
  label: string;
  description: string;
  config: Partial<CompetitionConfig>;
}

export const FOOTBALL_FORMATS: FootballFormatOption[] = [
  {
    id: "liga_regular",
    label: "Liga regular",
    description: "Todos contra todos, una vuelta (como muchas ligas cortas).",
    config: { baseFormat: "liga", homeAndAway: false, standingsEnabled: true },
  },
  {
    id: "liga_ida_vuelta",
    label: "Liga ida y vuelta",
    description: "Todos contra todos, dos vueltas (LaLiga, Premier, Serie A…).",
    config: { baseFormat: "liga", homeAndAway: true, standingsEnabled: true },
  },
  {
    id: "liga_inglesa",
    label: "Liga inglesa (20 equipos)",
    description: "38 jornadas, ida y vuelta, 3-1-0.",
    config: { baseFormat: "liga", homeAndAway: true, maxTeams: 20, standingsEnabled: true },
  },
  {
    id: "liga_espanola",
    label: "Liga española (20 equipos)",
    description: "38 jornadas, ida y vuelta, clasificación acumulada.",
    config: { baseFormat: "liga", homeAndAway: true, maxTeams: 20, standingsEnabled: true },
  },
  {
    id: "copa_eliminatoria",
    label: "Copa — eliminatoria directa",
    description: "Partido único, bracket completo hasta la final.",
    config: { baseFormat: "eliminatoria", homeAndAway: false, standingsEnabled: false },
  },
  {
    id: "copa_ida_vuelta",
    label: "Copa — ida y vuelta",
    description: "Eliminatorias a doble partido (Copa del Rey, Champions KO…).",
    config: { baseFormat: "eliminatoria", homeAndAway: true, standingsEnabled: false },
  },
  {
    id: "supercopa",
    label: "Supercopa (semifinal + final)",
    description: "4 equipos, bracket de 2 rondas.",
    config: { baseFormat: "eliminatoria", maxTeams: 4, standingsEnabled: false },
  },
  {
    id: "playoff_4",
    label: "Playoff 4 equipos",
    description: "Semifinales + final.",
    config: { baseFormat: "eliminatoria", maxTeams: 4, standingsEnabled: false },
  },
  {
    id: "playoff_8",
    label: "Playoff 8 equipos",
    description: "Cuartos, semifinales y final.",
    config: { baseFormat: "eliminatoria", maxTeams: 8, standingsEnabled: false },
  },
  {
    id: "grupos_4_ko",
    label: "Grupos de 4 + eliminatoria",
    description: "Fase de grupos round-robin + KO (estilo Eurocopa pequeña).",
    config: {
      baseFormat: "grupos_eliminatoria",
      groupsCount: 2,
      teamsPerGroup: 4,
      qualifiersPerGroup: 2,
      knockoutTeams: 4,
      standingsEnabled: true,
    },
  },
  {
    id: "grupos_6_ko",
    label: "Grupos de 6 + eliminatoria",
    description: "6 grupos de 4, pasan 2 por grupo (Mundial clásico).",
    config: {
      baseFormat: "grupos_eliminatoria",
      groupsCount: 6,
      teamsPerGroup: 4,
      qualifiersPerGroup: 2,
      knockoutTeams: 16,
      standingsEnabled: true,
    },
  },
  {
    id: "champions_32",
    label: "Champions League (32 equipos)",
    description: "8 grupos de 4 + eliminatoria ida/vuelta.",
    config: {
      baseFormat: "grupos_eliminatoria",
      groupsCount: 8,
      teamsPerGroup: 4,
      qualifiersPerGroup: 2,
      knockoutTeams: 16,
      homeAndAway: true,
      standingsEnabled: true,
    },
  },
  {
    id: "champions_16",
    label: "Champions (16 equipos directos)",
    description: "4 grupos de 4 + octavos en adelante.",
    config: {
      baseFormat: "grupos_eliminatoria",
      groupsCount: 4,
      teamsPerGroup: 4,
      qualifiersPerGroup: 2,
      knockoutTeams: 8,
      standingsEnabled: true,
    },
  },
  {
    id: "mundial_32",
    label: "Mundial (32 equipos)",
    description: "8 grupos de 4, top 2 + bracket hasta final.",
    config: {
      baseFormat: "grupos_eliminatoria",
      groupsCount: 8,
      teamsPerGroup: 4,
      qualifiersPerGroup: 2,
      knockoutTeams: 16,
      standingsEnabled: true,
    },
  },
  {
    id: "eurocopa_24",
    label: "Eurocopa (24 equipos)",
    description: "6 grupos de 4, pasan 2 + 4 mejores terceros → KO.",
    config: {
      baseFormat: "grupos_eliminatoria",
      groupsCount: 6,
      teamsPerGroup: 4,
      qualifiersPerGroup: 2,
      knockoutTeams: 16,
      standingsEnabled: true,
    },
  },
  {
    id: "torneo_apertura",
    label: "Torneo Apertura (liga corta)",
    description: "Liga de una vuelta, campeón por puntos.",
    config: { baseFormat: "liga", homeAndAway: false, standingsEnabled: true },
  },
  {
    id: "torneo_clausura",
    label: "Torneo Clausura (liga corta)",
    description: "Segunda vuelta del campeonato split.",
    config: { baseFormat: "liga", homeAndAway: false, standingsEnabled: true },
  },
];

export function getFootballFormat(id: FootballFormatId): FootballFormatOption {
  return FOOTBALL_FORMATS.find((f) => f.id === id) ?? FOOTBALL_FORMATS[0];
}
