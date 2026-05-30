export type CompetitionType =
  | "liga"
  | "eliminatoria_directa"
  | "ida_vuelta"
  | "grupos_eliminatoria";

export type UserRole = "user" | "captain" | "admin";

export type MatchStatus = "scheduled" | "live" | "finished";

export interface Club {
  id: string;
  name: string;
  tag: string;
  crestColor: string;
  logoUrl?: string;
  founderId?: string | null;
  captainId?: string | null;
  coCaptainUserIds: string[];
  founded: number;
  city: string;
  description: string;
  createdAt: string;
}

export interface Player {
  id: string;
  userId?: string;
  name: string;
  gamertag: string;
  avatarUrl?: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  nationality: string;
  clubId: string | null;
  number: number;
  rating: number;
  goals: number;
  assists: number;
  mvpAwards: number;
  matchesPlayed: number;
  createdAt: string;
}

export interface Competition {
  id: string;
  name: string;
  type: CompetitionType;
  season: string;
  status: "active" | "finished" | "upcoming";
  description: string;
  clubIds: string[];
  calendarGenerated?: boolean;
  calendarMode?: "manual" | "auto";
  config?: import("@/lib/types/competition-config").CompetitionConfig;
  createdAt: string;
}

export interface JoinRequest {
  id: string;
  clubId: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  userEmail?: string;
  userGamertag?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  playerId: string | null;
  captainClubId: string | null;
  managedClubIds: string[];
  avatarUrl: string | null;
  gamertag: string | null;
  playerName: string | null;
}

export interface Matchday {
  id: string;
  competitionId: string;
  number: number;
  name: string;
  startDate: string;
}

export interface MatchEvent {
  playerId: string;
  minute: number;
}

export interface Match {
  id: string;
  competitionId: string;
  matchdayId: string | null;
  homeClubId: string | null;
  awayClubId: string | null;
  scheduledAt: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  scorers: MatchEvent[];
  assists: MatchEvent[];
  mvpPlayerId: string | null;
  round?: string;
  feederMatchIds?: string[];
}

export interface KnockoutRound {
  id: string;
  competitionId: string;
  name: string;
  order: number;
  matchIds: string[];
}

export interface StandingRow {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface MatchReport {
  id: string;
  matchId: string;
  clubId: string;
  submittedById: string;
  homeScore: number;
  awayScore: number;
  scorers: MatchEvent[];
  assists: MatchEvent[];
  mvpPlayerId: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  submitterGamertag?: string;
  clubName?: string;
}

export interface TransferRecord {
  id: string;
  playerId: string;
  fromClubId: string | null;
  toClubId: string;
  date: string;
}

export interface AppData {
  clubs: Club[];
  players: Player[];
  competitions: Competition[];
  matchdays: Matchday[];
  matches: Match[];
  knockoutRounds: KnockoutRound[];
  transfers: TransferRecord[];
  joinRequests: JoinRequest[];
  matchReports: MatchReport[];
}

export type CreateClubInput = Pick<Club, "name"> & {
  crestColor: string;
  logoUrl?: string;
};
export type UpdateClubInput = Partial<
  Pick<Club, "name" | "tag" | "crestColor" | "logoUrl" | "city" | "description" | "founded">
>;
export type CreatePlayerInput = Omit<
  Player,
  "id" | "createdAt" | "goals" | "assists" | "mvpAwards" | "matchesPlayed"
>;
export type CreateCompetitionInput = Pick<
  Competition,
  "name" | "season" | "status"
> & {
  type?: CompetitionType;
  description?: string;
  clubIds?: string[];
  calendarMode?: "manual" | "auto";
  config?: import("@/lib/types/competition-config").CompetitionConfig;
};
export type CreateMatchInput = Omit<
  Match,
  "id" | "scorers" | "assists" | "mvpPlayerId" | "homeScore" | "awayScore" | "status"
> & { status?: MatchStatus };
