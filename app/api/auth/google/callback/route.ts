import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/auth/email";
import {
  exchangeGoogleCode,
  fetchGoogleProfile,
  isGoogleAuthConfigured,
} from "@/lib/auth/google";
import { loadSessionUserFromDb, setSessionCookie } from "@/lib/auth/session";
import { getSiteUrl } from "@/lib/config/site";
import { prisma } from "@/lib/db";
import { GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/auth/google";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const baseUrl = getSiteUrl();
  const loginUrl = new URL("/login", baseUrl);

  if (!isGoogleAuthConfigured()) {
    loginUrl.searchParams.set("error", "google_no_configurado");
    return NextResponse.redirect(loginUrl);
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    loginUrl.searchParams.set("error", "google_cancelado");
    return NextResponse.redirect(loginUrl);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(GOOGLE_OAUTH_STATE_COOKIE);

  if (!code || !state || !savedState || state !== savedState) {
    loginUrl.searchParams.set("error", "google_invalido");
    return NextResponse.redirect(loginUrl);
  }

  const tokens = await exchangeGoogleCode(code);
  if (!tokens) {
    loginUrl.searchParams.set("error", "google_token");
    return NextResponse.redirect(loginUrl);
  }

  const profile = await fetchGoogleProfile(tokens.accessToken);
  if (!profile) {
    loginUrl.searchParams.set("error", "google_perfil");
    return NextResponse.redirect(loginUrl);
  }

  const email = normalizeEmail(profile.email);

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId: profile.id }, { email }],
    },
    include: { player: true },
  });

  if (user && !user.googleId) {
    loginUrl.searchParams.set("error", "email_ya_registrado");
    return NextResponse.redirect(loginUrl);
  }

  if (!user) {
    const isFirstUser = (await prisma.user.count()) === 0;
    user = await prisma.user.create({
      data: {
        email,
        googleId: profile.id,
        emailVerified: true,
        role: isFirstUser ? "admin" : "user",
      },
      include: { player: true },
    });
  }

  const sessionUser = await loadSessionUserFromDb(user.id);
  if (!sessionUser) {
    loginUrl.searchParams.set("error", "sesion");
    return NextResponse.redirect(loginUrl);
  }

  await setSessionCookie(sessionUser);

  if (!user.player) {
    const completeUrl = new URL("/completar-registro", baseUrl);
    completeUrl.searchParams.set("name", profile.name);
    return NextResponse.redirect(completeUrl);
  }

  return NextResponse.redirect(new URL("/", baseUrl));
}
