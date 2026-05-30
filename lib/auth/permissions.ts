export type UserRole = "user" | "captain" | "admin";

export const ROLES: UserRole[] = ["user", "captain", "admin"];

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  playerId: string | null;
  captainClubId: string | null;
  managedClubIds: string[];
  avatarUrl: string | null;
  gamertag: string | null;
  playerName: string | null;
}

export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}

export function isCaptainOrAdmin(role: UserRole): boolean {
  return role === "captain" || role === "admin";
}

export function canEditResults(role: UserRole): boolean {
  return role === "admin";
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === "admin";
}

export function canManageRoles(role: UserRole): boolean {
  return role === "admin";
}
