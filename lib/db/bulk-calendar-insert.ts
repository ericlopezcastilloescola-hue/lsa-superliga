import { TBD_CLUB_ID } from "@/lib/constants/tbd-club";
import { prisma } from "@/lib/db";
import {
  executeTursoSql,
  isTursoAvailable,
  sqlDate,
  sqlInt,
  sqlLiteral,
} from "@/lib/db/turso-sql";

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function runStatements(statements: string[]) {
  if (isTursoAvailable()) {
    await executeTursoSql(statements);
    return;
  }

  for (const stmt of statements) {
    await prisma.$executeRawUnsafe(stmt);
  }
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
  if (rows.length === 0) return;
  const statements = chunk(rows, 50).map((group) => {
    const values = group
      .map(
        (r) =>
          `(${sqlLiteral(r.id)}, ${sqlLiteral(r.competitionId)}, ${sqlInt(r.number)}, ${sqlLiteral(r.name)}, ${sqlLiteral(r.startDate)})`,
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
  if (rows.length === 0) return;
  const statements = chunk(rows, 40).map((group) => {
    const values = group
      .map(
        (r) =>
          `(${sqlLiteral(r.id)}, ${sqlLiteral(r.competitionId)}, ${sqlLiteral(r.matchdayId)}, ${sqlLiteral(r.homeClubId)}, ${sqlLiteral(r.awayClubId)}, ${sqlDate(r.scheduledAt)}, 'scheduled', '[]', '[]', ${sqlLiteral(r.round)}, ${sqlLiteral(r.feederMatchIds)})`,
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
        `(${sqlLiteral(r.id)}, ${sqlLiteral(r.competitionId)}, ${sqlLiteral(r.name)}, ${sqlInt(r.order)}, ${sqlLiteral(r.matchIds)})`,
    )
    .join(",\n");
  await runStatements([
    `INSERT INTO "KnockoutRound" ("id", "competitionId", "name", "order", "matchIds") VALUES\n${values};`,
  ]);
}

export async function clearCompetitionCalendarSql(competitionId: string) {
  await runStatements([
    `DELETE FROM "Match" WHERE "competitionId" = ${sqlLiteral(competitionId)};`,
    `DELETE FROM "Matchday" WHERE "competitionId" = ${sqlLiteral(competitionId)};`,
    `DELETE FROM "KnockoutRound" WHERE "competitionId" = ${sqlLiteral(competitionId)};`,
  ]);
}

export async function ensureTbdClubSql() {
  await runStatements([
    `INSERT INTO "Club" ("id", "name", "tag", "crestColor", "city", "description", "founded", "createdAt")
     VALUES (${sqlLiteral(TBD_CLUB_ID)}, 'Por determinar', 'TBD', '#374151', '', 'Hueco del cuadro eliminatorio', ${sqlInt(new Date().getFullYear())}, datetime('now'))
     ON CONFLICT("id") DO NOTHING;`,
  ]);
}

export async function markCalendarGeneratedSql(competitionId: string) {
  await runStatements([
    `UPDATE "Competition" SET "calendarGenerated" = 1 WHERE "id" = ${sqlLiteral(competitionId)};`,
  ]);
}
