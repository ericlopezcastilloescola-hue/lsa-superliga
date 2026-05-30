"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { LeagueLogo } from "@/components/brand/league-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { useAuth } from "@/lib/store/auth-context";

type Step = "form" | "code";

export default function RegisterPage() {
  const { verifyRegister } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState({
    email: "",
    password: "",
    name: "",
    gamertag: "",
  });

  async function handleSendCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      name: String(fd.get("name")),
      gamertag: String(fd.get("gamertag")),
    };

    const res = await fetch("/api/auth/register/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Error al enviar el código");
      return;
    }

    setPending(payload);
    setStep("code");
    if (data.devCode) {
      setError(`Modo desarrollo: tu código es ${data.devCode}`);
    }
  }

  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const err = await verifyRegister({
      email: pending.email,
      code: String(fd.get("code")),
    });
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0E14] px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <LeagueLogo size="lg" />
        <h1 className="text-2xl font-bold text-white">Únete a la liga</h1>
        <p className="max-w-sm text-sm text-zinc-500">
          {step === "form"
            ? "Verificamos tu correo para evitar cuentas falsas"
            : `Hemos enviado un código a ${pending.email}`}
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardBody>
          {step === "form" ? (
            <>
              <GoogleSignInButton label="Registrarse con Google" />
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-zinc-500">o con email</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <form onSubmit={handleSendCode} className="space-y-4">
                <Input label="Email" name="email" type="email" required autoComplete="email" />
                <Input
                  label="Contraseña"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <Input label="Nombre real" name="name" required placeholder="Tu nombre" />
                <Input
                  label="Gamertag (jugador)"
                  name="gamertag"
                  required
                  placeholder="Tu nick en el juego"
                />
                {error && (
                  <p
                    className={`rounded-lg border px-4 py-3 text-sm ${
                      error.startsWith("Modo desarrollo")
                        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                    }`}
                  >
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando código…" : "Enviar código al correo"}
                </Button>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                label="Código de 6 dígitos"
                name="code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                placeholder="123456"
                autoComplete="one-time-code"
              />
              {error && (
                <p
                  className={`rounded-lg border px-4 py-3 text-sm ${
                    error.startsWith("Modo desarrollo")
                      ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                  }`}
                >
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verificando…" : "Verificar y crear cuenta"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setError(null);
                }}
                className="w-full text-sm text-zinc-500 hover:text-violet-400"
              >
                ← Volver al formulario
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-zinc-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-violet-400 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
