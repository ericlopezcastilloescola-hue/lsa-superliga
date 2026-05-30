import { createClient } from "@libsql/client";
import { prisma } from "@/lib/db";
import { getTursoConfig } from "@/lib/db/turso-config";

function sqlStr(value: string | null | undefined): string {
  if (value == null) return "NULL";
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlInt(value: number): string {
  return String(Math.trunc(value));
}

function sqlDate(value: Date): string {
  return sqlStr(value.toISOString());
}

async function runStatements(statements: string[]) {
  if (statements.length === 0) return;

  const turso = getTursoConfig();
  if (turso) {
    const client = createClient({
      url: turso.url,
      authToken: turso.authToken,
    });
    try {
      await client.executeMultiple(statements.join("\n"));
    } finally {
      client.close();
    }
    return;
  }

  for (const stmt of statements) {
    await prisma.$executeRawUnsafe(stmt);
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

export async function bulkInsertMatchdays(
  rows: {
    id: string;
    competitionId: string;
    number: number;
    name: string;
    startDate: string;
  }[],
) {
  const statements = chunk(rows, 50).map((group) => {
    const values = group
      .map(
        (r) =>
          `(${sqlStr(r.id)}, ${sqlStr(r.competitionId)}, ${sqlInt(r.number)}, ${sqlStr(r.name)}, ${sqlStr(r.startDate)})`,
      )
      .join(",\n");
    return `INSERT INTO "Matchday" ("id", "competitionId", "number", "name", "startDate") VALUES\n${values};`;
  });
  await runStatements(statements);
}

export async function bulkInsertMatches(
  rows: {
    id: string;
    competitionId: string;
    matchdayId: string | null;
    homeClubId: string;
    awayClubId: string;
    scheduledAt: Date;
    round: string | null;
    feederMatchIds: string | null;
  }[],
) {
  const statements = chunk(rows, 40).map((group) => {
    const values = group
      .map(
        (r) =>
          `(${sqlStr(r.id)}, ${sqlStr(r.competitionId)}, ${sqlStr(r.matchdayId)}, ${sqlStr(r.homeClubId)}, ${sqlStr(r.awayClubId)}, ${sqlDate(r.scheduledAt)}, 'scheduled', '[]', '[]', ${sqlStr(r.round)}, ${sqlStr(r.feederMatchIds)})`,
      )
      .join(",\n");
    return `INSERT INTO "Match" ("id", "competitionId", "matchdayId", "homeClubId", "awayClubId", "scheduledAt", "status", "scorers", "assists", "round", "feederMatchIds") VALUES\n${values};`;
  });
  await runStatements(statements);
}

export async function bulkInsertKnockoutRounds(
  rows: {
    id: string;
    competitionId: string;
    name: string;
    order: number;
    matchIds: string;
  }[],
) {
  if (rows.length === 0) return;
  const values = rows
    .map(
      (r) =>
        `(${sqlStr(r.id)}, ${sqlStr(r.competitionId)}, ${sqlStr(r.name)}, ${sqlInt(r.order)}, ${sqlStr(r.matchIds)})`,
    )
    .join(",\n");
  await runStatements([
    `INSERT INTO "KnockoutRound" ("id", "competitionId", "name", "order", "matchIds") VALUES\n${values};`,
  ]);
}
