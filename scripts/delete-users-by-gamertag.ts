/**
 * Elimina usuarios de prueba por gamertag (jugador + cuenta).
 * Uso: npx tsx scripts/delete-users-by-gamertag.ts yyy5555 Miguelin999 Papa1010
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

function loadEnvFile() {
  for (const name of [".env.clubes", ".env.vercel.production", ".env.vercel", ".env.local", ".env"]) {
    const envPath = path.join(process.cwd(), name);
    if (!existsSync(envPath)) continue;
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

loadEnvFile();

const gamertags = process.argv.slice(2);
if (gamertags.length === 0) {
  console.error("Indica al menos un gamertag.");
  process.exit(1);
}

function createClient(): PrismaClient {
  const url = (process.env.TURSO_DATABASE_URL ?? "")
    .replace(/^(?:libsql:\/\/)+/, "libsql://")
    .trim();
  const authToken = (process.env.TURSO_AUTH_TOKEN ?? "")
    .replace(/\s+/g, "")
    .replace(/^libsql:\/\//, "")
    .trim();

  if (url && authToken) {
    console.log("Conectando a Turso…");
    const adapter = new PrismaLibSQL({ url, authToken });
    return new PrismaClient({ adapter });
  }

  console.log("Conectando a BD local…");
  return new PrismaClient();
}

async function main() {
  const prisma = createClient();

  for (const tag of gamertags) {
    const player = await prisma.player.findUnique({
      where: { gamertag: tag },
      include: { user: true },
    });

    if (!player) {
      console.log(`❌ No encontrado: ${tag}`);
      continue;
    }

    await prisma.user.delete({ where: { id: player.userId } });
    console.log(`✓ Eliminado: ${tag} (${player.user.email})`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
