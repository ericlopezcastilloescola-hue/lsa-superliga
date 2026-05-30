"use client";

import { LeagueLanding } from "@/components/home/league-landing";
import { useAuth } from "@/lib/store/auth-context";

export default function HomePage() {
  const { isAdmin } = useAuth();

  return (
    <div className="w-full min-w-0 max-w-full">
      <LeagueLanding isAdmin={isAdmin} />
    </div>
  );
}
