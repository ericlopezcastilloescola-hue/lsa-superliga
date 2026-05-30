import type { SessionUser } from "@/lib/auth/permissions";
import type { AppData, Player } from "@/lib/types";

export function getVisiblePlayerIds(
  session: SessionUser,
  data: AppData,
  userClubId: string | null,
): Set<string> {
  if (session.role === "admin") {
    return new Set(data.players.map((p) => p.id));
  }

  const ids = new Set<string>();
  if (session.playerId) ids.add(session.playerId);

  if (userClubId) {
    for (const p of data.players) {
      if (p.clubId === userClubId) ids.add(p.id);
    }
  }

  const visibleClubIds = new Set<string>();
  for (const m of data.matches) {
    visibleClubIds.add(m.homeClubId);
    visibleClubIds.add(m.awayClubId);
  }
  for (const c of data.competitions) {
    for (const cid of c.clubIds) visibleClubIds.add(cid);
  }

  for (const p of data.players) {
    if (p.clubId && visibleClubIds.has(p.clubId)) ids.add(p.id);
  }

  return ids;
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
