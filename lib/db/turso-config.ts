export function normalizeTursoUrl(url: string): string {
  return url.replace(/^(?:libsql:\/\/)+/, "libsql://").trim();
}

export function normalizeTursoToken(token: string): string {
  return token.replace(/\s+/g, "").replace(/^libsql:\/\//, "").trim();
}

export function getTursoConfig() {
  const url = normalizeTursoUrl(process.env.TURSO_DATABASE_URL ?? "");
  const authToken = normalizeTursoToken(process.env.TURSO_AUTH_TOKEN ?? "");
  if (!url || !authToken) return null;
  return { url, authToken };
}
