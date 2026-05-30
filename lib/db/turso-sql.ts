import { createClient } from "@libsql/client";
import { getTursoConfig } from "@/lib/db/turso-config";

export function sqlLiteral(value: string | null | undefined): string {
  if (value == null) return "NULL";
  return `'${value.replace(/'/g, "''")}'`;
}

export function sqlInt(value: number): string {
  return String(Math.trunc(value));
}

export function sqlDate(value: Date): string {
  return sqlLiteral(value.toISOString());
}

export async function executeTursoSql(statements: string[]) {
  const turso = getTursoConfig();
  if (!turso) {
    throw new Error("Turso no configurado (TURSO_DATABASE_URL / TURSO_AUTH_TOKEN).");
  }

  const client = createClient({
    url: turso.url,
    authToken: turso.authToken,
  });

  try {
    await client.executeMultiple(statements.filter(Boolean).join("\n"));
  } finally {
    client.close();
  }
}

export function isTursoAvailable(): boolean {
  return getTursoConfig() != null;
}
