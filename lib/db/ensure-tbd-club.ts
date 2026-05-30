import { TBD_CLUB_ID } from "@/lib/constants/tbd-club";
import { prisma } from "@/lib/db";

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function ensureTbdClub(tx: Tx): Promise<void> {
  await tx.club.upsert({
    where: { id: TBD_CLUB_ID },
    create: {
      id: TBD_CLUB_ID,
      name: "Por determinar",
      tag: "TBD",
      crestColor: "#374151",
      city: "",
      description: "Hueco del cuadro eliminatorio",
      founded: new Date().getFullYear(),
    },
    update: {},
  });
}
