import { NextResponse } from "next/server";
import {
  getAuthPublicConfig,
  getGoogleRedirectUri,
  isEmailVerificationConfigured,
} from "@/lib/auth/auth-config";
import { isGoogleAuthConfigured } from "@/lib/auth/google";
import { getSiteUrl } from "@/lib/config/site";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const hasPendingTable = await prisma.pendingRegistration
      .count()
      .then(() => true)
      .catch(() => false);

    const config = getAuthPublicConfig();

    return NextResponse.json({
      ok: true,
      siteUrl: getSiteUrl(),
      emailVerification: config.emailVerification,
      google: config.google,
      googleRedirectUri: config.google ? getGoogleRedirectUri(getSiteUrl()) : null,
      emailFrom: process.env.EMAIL_FROM ?? null,
      hasPendingRegistrationTable: hasPendingTable,
      hints: {
        email: !config.emailVerification
          ? "Añade RESEND_API_KEY y EMAIL_FROM en Vercel."
          : null,
        google: !config.google
          ? "Añade GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en Vercel."
          : null,
        schema: !hasPendingTable
          ? "Ejecuta npm run db:push-turso para actualizar Turso."
          : null,
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Error comprobando auth",
        emailVerification: isEmailVerificationConfigured(),
        google: isGoogleAuthConfigured(),
      },
      { status: 500 },
    );
  }
}
