import { applyMatchResult, type MatchResultPayload } from "@/lib/db/match-results";
import { prisma } from "@/lib/db";
import { serializeEvents } from "@/lib/db/mappers";
import type { MatchEvent } from "@/lib/types";

function normalizeEvents(events: MatchEvent[]): string {
  return JSON.stringify(
    [...events]
      .filter((e) => e.playerId)
      .sort(
        (a, b) =>
          a.playerId.localeCompare(b.playerId) || (a.minute || 0) - (b.minute || 0),
      ),
  );
}

export function matchReportsAgree(a: MatchResultPayload, b: MatchResultPayload): boolean {
  if (a.homeScore !== b.homeScore || a.awayScore !== b.awayScore) return false;
  if ((a.mvpPlayerId ?? null) !== (b.mvpPlayerId ?? null)) return false;
  return (
    normalizeEvents(a.scorers) === normalizeEvents(b.scorers) &&
    normalizeEvents(a.assists) === normalizeEvents(b.assists)
  );
}

export async function upsertMatchReport(input: {
  matchId: string;
  clubId: string;
  submittedById: string;
  payload: MatchResultPayload;
}) {
  const { matchId, clubId, submittedById, payload } = input;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error("MATCH_NOT_FOUND");
  if (match.status === "finished") throw new Error("MATCH_ALREADY_FINISHED");
  if (clubId !== match.homeClubId && clubId !== match.awayClubId) {
    throw new Error("CLUB_NOT_IN_MATCH");
  }

  const scorers = payload.scorers.filter((s) => s.playerId);
  const assists = payload.assists.filter((a) => a.playerId);

  const report = await prisma.matchReport.upsert({
    where: { matchId_clubId: { matchId, clubId } },
    create: {
      matchId,
      clubId,
      submittedById,
      homeScore: payload.homeScore,
      awayScore: payload.awayScore,
      scorers: serializeEvents(scorers),
      assists: serializeEvents(assists),
      mvpPlayerId: payload.mvpPlayerId,
      status: "pending",
    },
    update: {
      submittedById,
      homeScore: payload.homeScore,
      awayScore: payload.awayScore,
      scorers: serializeEvents(scorers),
      assists: serializeEvents(assists),
      mvpPlayerId: payload.mvpPlayerId,
      status: "pending",
    },
  });

  const homeClubId = match.homeClubId!;
  const awayClubId = match.awayClubId!;

  const [homeReport, awayReport] = await Promise.all([
    prisma.matchReport.findUnique({
      where: { matchId_clubId: { matchId, clubId: homeClubId } },
    }),
    prisma.matchReport.findUnique({
      where: { matchId_clubId: { matchId, clubId: awayClubId } },
    }),
  ]);

  if (
    homeReport?.status === "pending" &&
    awayReport?.status === "pending" &&
    matchReportsAgree(
      {
        homeScore: homeReport.homeScore,
        awayScore: homeReport.awayScore,
        scorers: JSON.parse(homeReport.scorers) as MatchEvent[],
        assists: JSON.parse(homeReport.assists) as MatchEvent[],
        mvpPlayerId: homeReport.mvpPlayerId,
      },
      {
        homeScore: awayReport.homeScore,
        awayScore: awayReport.awayScore,
        scorers: JSON.parse(awayReport.scorers) as MatchEvent[],
        assists: JSON.parse(awayReport.assists) as MatchEvent[],
        mvpPlayerId: awayReport.mvpPlayerId,
      },
    )
  ) {
    await applyMatchResult(matchId, {
      homeScore: homeReport.homeScore,
      awayScore: homeReport.awayScore,
      scorers: JSON.parse(homeReport.scorers) as MatchEvent[],
      assists: JSON.parse(homeReport.assists) as MatchEvent[],
      mvpPlayerId: homeReport.mvpPlayerId,
    });

    await prisma.matchReport.updateMany({
      where: { matchId, status: "pending" },
      data: { status: "approved" },
    });

    return { report, autoApproved: true as const };
  }

  return { report, autoApproved: false as const };
}

export async function approveMatchReport(reportId: string) {
  const report = await prisma.matchReport.findUnique({ where: { id: reportId } });
  if (!report || report.status !== "pending") {
    throw new Error("REPORT_NOT_FOUND");
  }

  await applyMatchResult(report.matchId, {
    homeScore: report.homeScore,
    awayScore: report.awayScore,
    scorers: JSON.parse(report.scorers) as MatchEvent[],
    assists: JSON.parse(report.assists) as MatchEvent[],
    mvpPlayerId: report.mvpPlayerId,
  });

  await prisma.matchReport.updateMany({
    where: { matchId: report.matchId },
    data: { status: "approved" },
  });

  return report;
}

export async function rejectMatchReport(reportId: string) {
  const report = await prisma.matchReport.findUnique({ where: { id: reportId } });
  if (!report || report.status !== "pending") {
    throw new Error("REPORT_NOT_FOUND");
  }

  await prisma.matchReport.update({
    where: { id: reportId },
    data: { status: "rejected" },
  });

  return report;
}
