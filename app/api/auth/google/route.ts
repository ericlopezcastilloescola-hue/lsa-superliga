import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildGoogleAuthUrl, GOOGLE_OAUTH_STATE_COOKIE, isGoogleAuthConfigured } from "@/lib/auth/google";
import { getSiteUrl } from "@/lib/config/site";

export const runtime = "nodejs";

export async function GET() {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(
      new URL("/login?error=google_no_configurado", getSiteUrl()),
    );
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(buildGoogleAuthUrl(state));
}
