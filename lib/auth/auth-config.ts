import { isGoogleAuthConfigured } from "@/lib/auth/google";

export function isEmailVerificationConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getAuthPublicConfig() {
  return {
    emailVerification: isEmailVerificationConfigured(),
    google: isGoogleAuthConfigured(),
  };
}

export function getGoogleRedirectUri(siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, "")}/api/auth/google/callback`;
}
