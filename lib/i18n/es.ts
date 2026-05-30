import type {
  Competition,
  Match,
  Player,
} from "@/lib/types";

export const POSICION: Record<Player["position"], string> = {
  GK: "Portero",
  DEF: "Defensa",
  MID: "Mediocentro",
  FWD: "Delantero",
};

export const ESTADO_PARTIDO: Record<Match["status"], string> = {
  scheduled: "Programado",
  live: "En directo",
  finished: "Finalizado",
};

export const ESTADO_COMPETICION: Record<Competition["status"], string> = {
  active: "En curso",
  finished: "Finalizada",
  upcoming: "Próximamente",
};

export const TIPO_COMPETICION = {
  liga: "Liga",
  eliminatoria_directa: "Eliminatoria directa",
  ida_vuelta: "Ida y vuelta",
  grupos_eliminatoria: "Grupos + eliminatoria",
} as const;

export const MENSAJES = {
  resultadoGuardado: "Resultado guardado correctamente.",
  datosReseteados: "Datos restaurados a la demo inicial.",
  errorGoles: "El número de goles registrados no coincide con el marcador.",
  errorMarcador: "Introduce un marcador válido.",
  sinGoleadores: "Sin goleadores registrados",
  sinAsistencias: "Sin asistencias registradas",
  cargando: "Cargando LSA Superliga…",
} as const;
