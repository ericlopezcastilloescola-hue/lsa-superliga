import { getSiteUrl } from "@/lib/config/site";
import { getGoogleRedirectUri } from "@/lib/auth/auth-config";

export const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function isGoogleAuthConfigured(): boolean {
  return getGoogleConfig() !== null;
}

export function buildGoogleAuthUrl(state: string): string {
  const config = getGoogleConfig();
  if (!config) throw new Error("Google OAuth no configurado");

  const redirectUri = getGoogleRedirectUri(getSiteUrl());
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<{
  accessToken: string;
} | null> {
  const config = getGoogleConfig();
  if (!config) return null;

  const redirectUri = getGoogleRedirectUri(getSiteUrl());
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) return null;
  return { accessToken: data.access_token };
}

export async function fetchGoogleProfile(accessToken: string): Promise<{
  id: string;
  email: string;
  name: string;
  picture?: string;
} | null> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
    verified_email?: boolean;
  };

  if (!data.id || !data.email) return null;
  if (data.verified_email === false) return null;

  return {
    id: data.id,
    email: data.email.toLowerCase(),
    name: data.name ?? data.email.split("@")[0] ?? "Jugador",
    picture: data.picture,
  };
}
