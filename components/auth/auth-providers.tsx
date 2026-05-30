"use client";

import { useEffect, useState } from "react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

type AuthConfig = {
  emailVerification: boolean;
  google: boolean;
};

export function AuthProviders({
  googleLabel = "Continuar con Google",
}: {
  googleLabel?: string;
}) {
  const [config, setConfig] = useState<AuthConfig | null>(null);

  useEffect(() => {
    fetch("/api/auth/config")
      .then((r) => r.json())
      .then((data: AuthConfig) => setConfig(data))
      .catch(() => setConfig({ emailVerification: false, google: false }));
  }, []);

  if (!config?.google) return null;

  return (
    <>
      <GoogleSignInButton label={googleLabel} />
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-zinc-500">o con email</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
    </>
  );
}
