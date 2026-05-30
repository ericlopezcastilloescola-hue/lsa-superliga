"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthProviders } from "@/components/auth/auth-providers";
import { LeagueLogo } from "@/components/brand/league-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { useAuth } from "@/lib/store/auth-context";

const ERROR_MESSAGES: Record<string, string> = {
  google_no_configurado: "Google no está configurado todavía en el servidor.",
  google_cancelado: "Has cancelado el inicio de sesión con Google.",
  google_invalido: "Sesión de Google no válida. Inténtalo de nuevo.",
  google_token: "No se pudo conectar con Google. Inténtalo más tarde.",
  google_perfil: "No se pudo leer tu perfil de Google.",
  email_ya_registrado:
    "Ese correo ya está registrado con contraseña. Inicia sesión con email.",
  sesion: "Error al crear la sesión. Inténtalo de nuevo.",
};

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const urlError = useMemo(() => {
    const code = searchParams.get("error");
    if (!code) return null;
    return ERROR_MESSAGES[code] ?? "Error al iniciar sesión con Google.";
  }, [searchParams]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const err = await login(
      String(fd.get("email")),
      String(fd.get("password")),
    );
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    const from = searchParams.get("from") || "/";
    router.push(from);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0E14] px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <LeagueLogo size="lg" />
        <h1 className="text-2xl font-bold text-white">LSA Superliga</h1>
        <p className="text-sm text-zinc-500">Inicia sesión para acceder a la liga</p>
      </div>

      <Card className="w-full max-w-md">
        <CardBody>
          <AuthProviders />
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" name="email" type="email" required autoComplete="email" />
            <Input
              label="Contraseña"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
            {(error || urlError) && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error ?? urlError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando…" : "Iniciar sesión"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-zinc-500">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-violet-400 hover:underline">
              Regístrate
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
