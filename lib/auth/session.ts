import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionUser, UserRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "lsa_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    playerId: user.playerId,
    captainClubId: user.captainClubId,
    avatarUrl: user.avatarUrl,
    gamertag: user.gamertag,
    playerName: user.playerName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: String(payload.id),
      email: String(payload.email),
      role: payload.role as UserRole,
      playerId: payload.playerId ? String(payload.playerId) : null,
    captainClubId: payload.captainClubId ? String(payload.captainClubId) : null,
    avatarUrl: payload.avatarUrl ? String(payload.avatarUrl) : null,
    gamertag: payload.gamertag ? String(payload.gamertag) : null,
    playerName: payload.playerName ? String(payload.playerName) : null,
  };
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const tokenUser = await verifySessionToken(token);
  if (!tokenUser) return null;
  const dbUser = await loadSessionUserFromDb(tokenUser.id);
  return dbUser ?? tokenUser;
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

export async function loadSessionUserFromDb(
  userId: string,
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { player: true },
  });
  if (!user) return null;

  const captainClub = await prisma.club.findFirst({
    where: { captainId: userId },
    select: { id: true },
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
    playerId: user.player?.id ?? null,
    captainClubId: captainClub?.id ?? null,
    avatarUrl: user.player?.avatarUrl ?? null,
    gamertag: user.player?.gamertag ?? null,
    playerName: user.player?.name ?? null,
  };
}

export { COOKIE_NAME };
