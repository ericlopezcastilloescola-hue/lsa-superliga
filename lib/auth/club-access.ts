import type { Club } from "@/lib/types";
import { prisma } from "@/lib/db";

export function isPrimaryCaptain(
  userId: string,
  club: Pick<Club, "captainId">,
): boolean {
  return !!club.captainId && club.captainId === userId;
}

export function canManageClubClient(
  userId: string,
  club: Pick<Club, "captainId" | "coCaptainUserIds">,
): boolean {
  if (club.captainId === userId) return true;
  return club.coCaptainUserIds.includes(userId);
}

export async function canManageClubDb(
  userId: string,
  clubId: string,
  isAdmin = false,
): Promise<boolean> {
  if (isAdmin) return true;

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      captainId: true,
      coCaptains: { select: { userId: true } },
    },
  });
  if (!club) return false;
  if (club.captainId === userId) return true;
  return club.coCaptains.some((c) => c.userId === userId);
}

export async function isPrimaryCaptainDb(
  userId: string,
  clubId: string,
): Promise<boolean> {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { captainId: true },
  });
  return club?.captainId === userId;
}
