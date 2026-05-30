import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { fetchDataForUser } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const data = await fetchDataForUser(session);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
