import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const players = await prisma.player.findMany({
  select: { id: true, gamertag: true, createdAt: true },
  orderBy: { createdAt: "asc" },
});

const seen = new Map();
for (const player of players) {
  const count = seen.get(player.gamertag) ?? 0;
  if (count > 0) {
    const newTag = `${player.gamertag}_${count + 1}`;
    await prisma.player.update({
      where: { id: player.id },
      data: { gamertag: newTag },
    });
    console.log(`Renamed ${player.gamertag} -> ${newTag} (${player.id})`);
  }
  seen.set(player.gamertag, count + 1);
}

console.log("Done.");
await prisma.$disconnect();
