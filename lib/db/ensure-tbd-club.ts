import { TBD_CLUB_ID } from "@/lib/constants/tbd-club";
import { prisma } from "@/lib/db";

type DbClient = Pick<typeof prisma, "club">;

export async function ensureTbdClub(db: DbClient): Promise<void> {
  await db.club.upsert({
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
