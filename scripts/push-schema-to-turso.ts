/**
 * Crea tablas nuevas en Turso si no existen (idempotente).
 * Requiere TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en .env / Vercel.
 *
 * Uso: npm run db:push-turso
 */
import { readFileSync, existsSync } from "fs";
import { createClient } from "@libsql/client";
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

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS "ClubCoCaptain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedByUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClubCoCaptain_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClubCoCaptain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClubCoCaptain_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ClubCoCaptain_clubId_userId_key" ON "ClubCoCaptain"("clubId", "userId");

CREATE TABLE IF NOT EXISTS "MatchReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,
    "scorers" TEXT NOT NULL DEFAULT '[]',
    "assists" TEXT NOT NULL DEFAULT '[]',
    "mvpPlayerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MatchReport_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchReport_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchReport_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "MatchReport_matchId_clubId_key" ON "MatchReport"("matchId", "clubId");
`;

loadEnvFile();

const tursoUrl = normalizeTursoUrl(process.env.TURSO_DATABASE_URL ?? "");
const tursoToken = normalizeTursoToken(process.env.TURSO_AUTH_TOKEN ?? "");

if (!tursoUrl || !tursoToken) {
  if (process.env.VERCEL === "1") {
    console.warn("Turso no configurado; omitiendo db push.");
    process.exit(0);
  }
  console.error("Faltan TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en .env");
  process.exit(1);
}

async function main() {
  const client = createClient({ url: tursoUrl, authToken: tursoToken });

  try {
    await client.execute('SELECT 1 FROM "MatchReport" LIMIT 1');
    console.log("Turso ya tiene las tablas de co-capitanes e informes.");
    return;
  } catch {
    console.log("Creando tablas ClubCoCaptain y MatchReport en Turso...");
  }

  try {
    await client.executeMultiple(MIGRATION_SQL);
    console.log("Turso actualizado correctamente.");
  } finally {
    client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
