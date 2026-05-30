/**
 * Aplica el esquema Prisma actual a Turso (tablas nuevas: PendingRegistration, googleId, etc.)
 * Uso: npm run db:push-turso
 * Requiere TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en .env
 */
import { createClient } from "@libsql/client";
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
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
      if (process.env[key]) continue;
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

const tursoUrl = (process.env.TURSO_DATABASE_URL ?? "")
  .replace(/^(?:libsql:\/\/)+/, "libsql://")
  .trim();
const tursoToken = (process.env.TURSO_AUTH_TOKEN ?? "")
  .replace(/\s+/g, "")
  .replace(/^libsql:\/\//, "")
  .trim();

if (!tursoUrl || !tursoToken) {
  console.error("Faltan TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en .env");
  process.exit(1);
}

async function main() {
  console.log("Generando SQL de migración...");
  const sql = execSync(
    "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
    { encoding: "utf8" },
  );

  const client = createClient({ url: tursoUrl, authToken: tursoToken });

  console.log("Aplicando esquema en Turso...");
  try {
    await client.executeMultiple(sql);
    console.log("Esquema aplicado correctamente.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("already exists")) {
      console.log("Algunas tablas ya existían. Aplicando diff incremental...");
      const incremental = execSync(
        `npx prisma migrate diff --from-url "${tursoUrl}" --to-schema-datamodel prisma/schema.prisma --script`,
        {
          encoding: "utf8",
          env: { ...process.env, TURSO_AUTH_TOKEN: tursoToken },
        },
      );
      if (incremental.trim()) {
        await client.executeMultiple(incremental);
        console.log("Migración incremental aplicada.");
      } else {
        console.log("Turso ya está al día.");
      }
    } else {
      throw e;
    }
  } finally {
    client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
