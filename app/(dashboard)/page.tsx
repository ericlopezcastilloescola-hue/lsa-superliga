"use client";

import { LeagueContact } from "@/components/home/league-contact";
import { LeagueLanding } from "@/components/home/league-landing";
import { useAuth } from "@/lib/store/auth-context";

export default function HomePage() {
  const { isAdmin } = useAuth();

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 sm:space-y-6">
      <LeagueLanding isAdmin={isAdmin} />
      <LeagueContact />
    </div>
  );
}
