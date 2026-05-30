import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import {
  approveMatchReport,
  rejectMatchReport,
} from "@/lib/db/match-reports";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; reportId: string }> },
) {
  try {
    await requireAdmin();
    const { reportId } = await params;
    const body = await request.json();
    const { action } = body as { action?: "approve" | "reject" };

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
    }

    if (action === "approve") {
      await approveMatchReport(reportId);
    } else {
      await rejectMatchReport(reportId);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    if (e instanceof Error && e.message === "REPORT_NOT_FOUND") {
      return NextResponse.json({ error: "Informe no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al procesar informe." }, { status: 500 });
  }
}
