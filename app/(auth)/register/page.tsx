"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LeagueLogo } from "@/components/brand/league-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { useAuth } from "@/lib/store/auth-context";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const err = await register({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      name: String(fd.get("name")),
      gamertag: String(fd.get("gamertag")),
    });
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0E14] px-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <LeagueLogo size="lg" />
        <h1 className="text-2xl font-bold text-white">Únete a la liga</h1>
        <p className="text-sm text-zinc-500">
          Al registrarte creas tu perfil de jugador automáticamente
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando cuenta…" : "Registrarse"}
            </Button>
          </form>
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
