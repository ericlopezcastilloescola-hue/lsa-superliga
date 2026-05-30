/**
 * Aplica cambios del schema.prisma a Turso (producción).
 * Requiere TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en .env
 *
 * Uso: npm run db:push-turso
 */
import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
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

loadEnvFile();

const tursoUrl = normalizeTursoUrl(process.env.TURSO_DATABASE_URL ?? "");
const tursoToken = normalizeTursoToken(process.env.TURSO_AUTH_TOKEN ?? "");

if (!tursoUrl || !tursoToken) {
  if (process.env.VERCEL === "1") {
    console.warn("Turso no configurado en Vercel; omitiendo db push.");
    process.exit(0);
  }
  console.error("Faltan TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en .env");
  process.exit(1);
}

async function main() {
  console.log("Comparando schema con Turso...");
  const fromUrl = `${tursoUrl}?authToken=${tursoToken}`;
  const sql = execSync(
    `npx prisma migrate diff --from-url "${fromUrl}" --to-schema-datamodel prisma/schema.prisma --script`,
    { encoding: "utf8" },
  );

  if (!sql.trim() || sql.includes("This is an empty migration")) {
    console.log("Turso ya está al día con el schema.");
    return;
  }

  console.log("Aplicando cambios...");
  const client = createClient({ url: tursoUrl, authToken: tursoToken });
  try {
    await client.executeMultiple(sql);
    console.log("Turso actualizado correctamente.");
  } finally {
    client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
