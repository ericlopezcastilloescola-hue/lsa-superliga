/**
 * Copia la BD local (prisma/dev.db) a Turso.
 * Requiere en .env: TURSO_DATABASE_URL y TURSO_AUTH_TOKEN
 *
 * Uso: npm run db:sync-turso
 */
import { readFileSync, existsSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
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
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile();

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  console.error("");
  console.error("Faltan TURSO_DATABASE_URL y TURSO_AUTH_TOKEN.");
  console.error("Añádelas en el archivo .env de tu PC (no solo en Vercel):");
  console.error("");
  console.error("  TURSO_DATABASE_URL=libsql://...");
  console.error("  TURSO_AUTH_TOKEN=tu-token");
  console.error("");
  console.error("Cópialas desde https://app.turso.tech → tu base de datos → Connect");
  process.exit(1);
}

const localDbPath = path.join(process.cwd(), "prisma", "dev.db");
const local = new PrismaClient({
  datasources: { db: { url: `file:${localDbPath}` } },
});

const remote = new PrismaClient({
  adapter: new PrismaLibSql({
    url: tursoUrl,
    authToken: tursoToken,
  }),
});

async function main() {
  console.log("Aplicando esquema en Turso...");
  const { execSync } = await import("child_process");
  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: tursoUrl },
  });

  console.log("Copiando datos locales → Turso...");

  const [
    users,
    clubs,
    players,
    joinRequests,
    competitions,
    competitionClubs,
    matchdays,
    matches,
    knockoutRounds,
    transfers,
  ] = await Promise.all([
    local.user.findMany(),
    local.club.findMany(),
    local.player.findMany(),
    local.joinRequest.findMany(),
    local.competition.findMany(),
    local.competitionClub.findMany(),
    local.matchday.findMany(),
    local.match.findMany(),
    local.knockoutRound.findMany(),
    local.transferRecord.findMany(),
  ]);

  console.log(`Usuarios: ${users.length}, clubes: ${clubs.length}, jugadores: ${players.length}`);

  await remote.$transaction([
    remote.transferRecord.deleteMany(),
    remote.knockoutRound.deleteMany(),
    remote.match.deleteMany(),
    remote.matchday.deleteMany(),
    remote.competitionClub.deleteMany(),
    remote.competition.deleteMany(),
    remote.joinRequest.deleteMany(),
    remote.player.deleteMany(),
    remote.club.deleteMany(),
    remote.user.deleteMany(),
  ]);

  for (const u of users) {
    await remote.user.create({ data: u });
  }
  for (const c of clubs) {
    await remote.club.create({ data: c });
  }
  for (const p of players) {
    await remote.player.create({ data: p });
  }
  for (const j of joinRequests) {
    await remote.joinRequest.create({ data: j });
  }
  for (const c of competitions) {
    await remote.competition.create({ data: c });
  }
  for (const cc of competitionClubs) {
    await remote.competitionClub.create({ data: cc });
  }
  for (const md of matchdays) {
    await remote.matchday.create({ data: md });
  }
  for (const m of matches) {
    await remote.match.create({ data: m });
  }
  for (const kr of knockoutRounds) {
    await remote.knockoutRound.create({ data: kr });
  }
  for (const t of transfers) {
    await remote.transferRecord.create({ data: t });
  }

  console.log("Datos copiados a Turso correctamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await local.$disconnect();
    await remote.$disconnect();
  });
