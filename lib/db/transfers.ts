import { prisma } from "@/lib/db";

export async function transferPlayerToClub(
  playerId: string,
  toClubId: string | null,
) {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { id: true, clubId: true, userId: true },
  });

  if (!player) {
    throw new Error("PLAYER_NOT_FOUND");
  }

  if (player.clubId === toClubId) {
    throw new Error("SAME_CLUB");
  }

  if (toClubId) {
    const club = await prisma.club.findUnique({ where: { id: toClubId } });
    if (!club) {
      throw new Error("CLUB_NOT_FOUND");
    }
  }

  const fromClubId = player.clubId;
  const today = new Date().toISOString().slice(0, 10);

  await prisma.$transaction(async (tx) => {
    await tx.player.update({
      where: { id: playerId },
      data: { clubId: toClubId },
    });

    await tx.joinRequest.updateMany({
      where: { userId: player.userId, status: "pending" },
      data: { status: "rejected" },
    });

    if (fromClubId) {
      await tx.club.updateMany({
        where: { id: fromClubId, captainId: player.userId },
        data: { captainId: null },
      });
    }

    if (toClubId) {
      await tx.transferRecord.create({
        data: {
          playerId,
          fromClubId,
          toClubId,
          date: today,
        },
      });
    }
  });
}
