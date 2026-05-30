import { Resend } from "resend";
import { SITE_EMAIL, SITE_NAME } from "@/lib/config/site";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendVerificationEmail(
  email: string,
  code: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const resend = getResend();
  const from = process.env.EMAIL_FROM ?? SITE_EMAIL;

  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[dev] Código de verificación para ${email}: ${code}`);
      return { ok: true };
    }
    return {
      ok: false,
      error:
        "El envío de correos no está configurado. Añade RESEND_API_KEY y EMAIL_FROM en Vercel.",
    };
  }

  try {
    const { error } = await resend.emails.send({
      from: `${SITE_NAME} <${from}>`,
      to: email,
      subject: `Tu código de verificación — ${SITE_NAME}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h1 style="color:#7c3aed;font-size:20px">${SITE_NAME}</h1>
          <p style="color:#333;line-height:1.6">
            Usa este código para completar tu registro. Caduca en 15 minutos.
          </p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#111">${code}</p>
          <p style="color:#666;font-size:13px">
            Si no has solicitado este código, ignora este correo.
          </p>
        </div>
      `,
    });

    if (error) {
      return { ok: false, error: error.message ?? "No se pudo enviar el correo." };
    }

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al enviar el correo.",
    };
  }
}
