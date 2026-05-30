/**
 * Copia la BD local (prisma/dev.db) a Turso.
 * Requiere en .env: TURSO_DATABASE_URL y TURSO_AUTH_TOKEN
 *
 * Uso: npm run db:sync-turso
 */
import { readFileSync, existsSync } from "fs";
import { createClient } from "@libsql/client";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

function loadEnvFile() {
  for (const name of [".env", ".env.local"]) {
    const envPath = path.join(process.cwd(), name);
    if (!existsSync(envPath)) continue;
    const content = readFileSync(envPath, "utf8");

    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      if (key === "TURSO_AUTH_TOKEN") continue;
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }

    const tokenMatch = content.match(
      /TURSO_AUTH_TOKEN=([\s\S]+?)(?=\r?\n[A-Za-z_][A-Za-z0-9_]*=|\s*$)/,
    );
    if (tokenMatch && !process.env.TURSO_AUTH_TOKEN) {
      process.env.TURSO_AUTH_TOKEN = tokenMatch[1].trim();
    }
  }
}

function normalizeTursoUrl(url: string): string {
  return url.replace(/^(?:libsql:\/\/)+/, "libsql://").trim();
}

function normalizeTursoToken(token: string): string {
  return token.replace(/\s+/g, "").replace(/^libsql:\/\//, "").trim();
}

loadEnvFile();

const tursoUrl = normalizeTursoUrl(process.env.TURSO_DATABASE_URL ?? "");
const tursoToken = normalizeTursoToken(process.env.TURSO_AUTH_TOKEN ?? "");

if (!tursoUrl || !tursoToken) {
  console.error("");
  console.error("Faltan TURSO_DATABASE_URL y TURSO_AUTH_TOKEN.");
  console.error("Archivo: c:\\Users\\Eric\\lsa-superliga\\.env");
  console.error("");
  console.error("Ejemplo CORRECTO (fíjate: libsql:// solo una vez):");
  console.error("");
  console.error("  TURSO_DATABASE_URL=libsql://lsa-superliga-xxx.aws-eu-west-1.turso.io");
  console.error("  TURSO_AUTH_TOKEN=eyJhbGciOi...todo-el-token-en-una-linea");
  console.error("");
  console.error("Errores habituales:");
  console.error("  - libsql://libsql://  (duplicado)  ← MAL");
  console.error("  - token partido en varias líneas     ← MAL");
  console.error("  - libsql:// delante del token       ← MAL");
  console.error("");
  console.error("Guarda con Ctrl+S y vuelve a ejecutar npm run db:sync-turso");
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

async function ensureTursoSchema(url: string, token: string) {
  const client = createClient({ url, authToken: token });

  try {
    await client.execute('SELECT 1 FROM "User" LIMIT 1');
    console.log("Esquema ya existe en Turso.");
    client.close();
    return;
  } catch {
    console.log("Creando tablas en Turso...");
  }

  const { execSync } = await import("child_process");
  const sql = execSync(
    "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
    { encoding: "utf8" },
  );

  await client.executeMultiple(sql);
  client.close();
  console.log("Esquema creado en Turso.");
}

async function main() {
  await ensureTursoSchema(tursoUrl, tursoToken);

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
