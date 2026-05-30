"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-context";

export default function JugadoresRedirectPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(isAdmin ? "/admin/jugadores" : "/");
  }, [isAdmin, loading, router]);

  return null;
}
