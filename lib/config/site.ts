/** Dominio oficial de la plataforma */
export const SITE_DOMAIN = "lsasuperliga.es";

/** URL pública usada en OAuth, emails y enlaces absolutos */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;

  return `https://${SITE_DOMAIN}`;
}

export const SITE_URL = getSiteUrl();

export const SITE_NAME = "LSA Superliga";

export const SITE_TAGLINE = "Clubes Pro — Liga, copas y estadísticas esports";

export const SITE_DESCRIPTION =
  "Plataforma oficial de la LSA Superliga en lsasuperliga.es. Clasificación, clubes, jugadores, partidos y competiciones.";

export const SITE_EMAIL = "info@lsasuperliga.es";
