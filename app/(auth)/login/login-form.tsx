"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LeagueLogo } from "@/components/brand/league-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { useAuth } from "@/lib/store/auth-context";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0E14] px-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <LeagueLogo size="lg" />
        <h1 className="text-2xl font-bold text-white">LSA Superliga</h1>
        <p className="text-sm text-zinc-500">Inicia sesión para acceder a la liga</p>
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
              autoComplete="current-password"
            />
            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
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
