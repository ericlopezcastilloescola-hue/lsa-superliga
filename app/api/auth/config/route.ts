import { NextResponse } from "next/server";
import { getAuthPublicConfig, getGoogleRedirectUri } from "@/lib/auth/auth-config";
import { getSiteUrl } from "@/lib/config/site";

export async function GET() {
  const config = getAuthPublicConfig();
  return NextResponse.json({
    ...config,
    googleRedirectUri: config.google ? getGoogleRedirectUri(getSiteUrl()) : null,
  });
}
