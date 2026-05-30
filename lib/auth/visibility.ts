import type { SessionUser } from "@/lib/auth/permissions";
import type { AppData, Player } from "@/lib/types";

/** Jugadores visibles en stats, perfiles y plantillas (toda la liga). */
export function getVisiblePlayerIds(
  _session: SessionUser,
  data: AppData,
  _userClubId: string | null,
): Set<string> {
  return new Set(data.players.map((p) => p.id));
}

export function filterVisiblePlayers(
  session: SessionUser,
  data: AppData,
  userClubId: string | null,
): Player[] {
  const ids = getVisiblePlayerIds(session, data, userClubId);
  return data.players.filter((p) => ids.has(p.id));
}

export function canViewPlayer(
  session: SessionUser,
  data: AppData,
  playerId: string,
  userClubId: string | null,
): boolean {
  return getVisiblePlayerIds(session, data, userClubId).has(playerId);
}

export function isClubCaptain(
  userId: string,
  clubCaptainId: string | null | undefined,
  isAdmin = false,
): boolean {
  if (isAdmin) return true;
  return !!clubCaptainId && clubCaptainId === userId;
}
