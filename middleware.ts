import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth/session";

const AUTH_PAGES = ["/login", "/register"];
const OPEN_AUTH_PAGES = ["/login", "/register", "/completar-registro"];

const PUBLIC_API_PREFIXES = [
  "/api/auth/login",
  "/api/auth/register/send-code",
  "/api/auth/register/verify",
  "/api/auth/google",
  "/api/auth/google/callback",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/health") ||
    pathname.includes(".") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isOpenAuthPage = OPEN_AUTH_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isPublicApi =
    PUBLIC_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname === "/api/auth/me" ||
    pathname.startsWith("/api/health");

  if (isPublicApi) {
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    if (isOpenAuthPage) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const needsProfile = !session.playerId;

  if (needsProfile && pathname !== "/completar-registro") {
    if (pathname.startsWith("/api/")) {
      if (pathname === "/api/auth/complete-profile" || pathname === "/api/auth/logout") {
        return NextResponse.next();
      }
      return NextResponse.json(
        { error: "Completa tu perfil de jugador primero." },
        { status: 403 },
      );
    }
    return NextResponse.redirect(new URL("/completar-registro", request.url));
  }

  if (
    !needsProfile &&
    (AUTH_PAGES.some((p) => pathname === p) || pathname === "/completar-registro")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"],
};
