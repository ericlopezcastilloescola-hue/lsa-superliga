import { NextResponse } from "next/server";

/** @deprecated Usa /api/auth/register/send-code y /api/auth/register/verify */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "El registro requiere verificación por correo. Recarga la página e inténtalo de nuevo.",
    },
    { status: 410 },
  );
}
