import { NextResponse } from "next/server";
import {
  getSessionUser,
  setSessionCookie,
  verifySessionToken,
  COOKIE_NAME,
} from "@/lib/auth/session";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const tokenUser = token ? await verifySessionToken(token) : null;

    if (
      tokenUser &&
      (tokenUser.role !== user.role ||
        tokenUser.captainClubId !== user.captainClubId ||
        tokenUser.playerId !== user.playerId ||
        JSON.stringify(tokenUser.managedClubIds) !== JSON.stringify(user.managedClubIds))
    ) {
      await setSessionCookie(user);
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
