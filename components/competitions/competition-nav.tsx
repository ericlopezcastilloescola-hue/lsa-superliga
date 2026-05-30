"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Competition } from "@/lib/types";
import { hasKnockout, hasStandings } from "@/lib/utils/competition-calendar";

export function CompetitionNav({
  comp,
  id,
}: {
  comp: Competition;
  id: string;
}) {
  const pathname = usePathname();
  const base = `/competiciones/${id}`;

  const tabs = [
    { href: base, label: "Calendario", show: true },
    {
      href: `${base}/clasificacion`,
      label: "Clasificación",
      show: hasStandings(comp.type, comp.config),
    },
    {
      href: `${base}/eliminatorias`,
      label: "Eliminatorias",
      show: hasKnockout(comp.type, comp.config),
    },
  ].filter((t) => t.show);

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
      {tabs.map((tab) => {
        const active =
          tab.href === base
            ? pathname === base
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-violet-500/15 text-violet-300"
                : "text-zinc-400 hover:bg-white/5"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
