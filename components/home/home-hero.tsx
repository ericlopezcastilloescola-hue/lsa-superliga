"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_DOMAIN } from "@/lib/config/site";

export function HomeHero({
  isAdmin,
  stats,
}: {
  isAdmin: boolean;
  stats: { clubs: number; competitions: number; matches: number };
}) {
  return (
    <section className="mb-4 w-full min-w-0 overflow-hidden rounded-xl border border-violet-500/20 bg-[#12151c] sm:mb-8 sm:rounded-2xl sm:border-violet-500/25 sm:bg-gradient-to-br sm:from-[#12151c] sm:via-[#0d1018] sm:to-[#1a0a14]">
      <div className="p-4 sm:p-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400 sm:text-xs">
          {SITE_DOMAIN}
        </p>
        <h1 className="mt-1 text-xl font-black text-white sm:mt-2 sm:text-4xl">
          LSA Superliga
        </h1>
        <p className="text-sm text-zinc-400 sm:text-lg">Clubes Pro</p>
        <p className="mt-2 hidden text-sm text-zinc-500 sm:block">
          Clasificaciones, calendarios, resultados y estadísticas de la liga.
        </p>

        {isAdmin ? (
          <>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:mt-6 sm:flex sm:flex-wrap sm:gap-3">
              <Button href="/admin" className="w-full justify-center sm:w-auto">
                Panel Admin
              </Button>
              <Button
                href="/admin/competiciones"
                variant="secondary"
                className="w-full justify-center sm:w-auto"
              >
                Competiciones
              </Button>
              <Button
                href="/admin/clubes"
                variant="secondary"
                className="w-full justify-center sm:w-auto"
              >
                Clubes
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6">
              {[
                { label: "Clubes", value: stats.clubs, href: "/clubes" },
                {
                  label: "Ligas",
                  value: stats.competitions,
                  href: "/competiciones",
                },
                { label: "Partidos", value: stats.matches, href: "/partidos" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2.5 text-center transition-colors active:bg-violet-500/10 sm:rounded-xl sm:px-4 sm:py-3"
                >
                  <p className="text-lg font-black text-violet-300 sm:text-2xl">
                    {item.value}
                  </p>
                  <p className="text-[9px] uppercase tracking-wide text-zinc-500 sm:text-xs">
                    {item.label}
                  </p>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-8">
            {[
              { label: "Clubes", value: stats.clubs, href: "/clubes" },
              {
                label: "Ligas",
                value: stats.competitions,
                href: "/competiciones",
              },
              { label: "Partidos", value: stats.matches, href: "/partidos" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2.5 text-center transition-colors active:bg-violet-500/10 sm:rounded-xl sm:px-4 sm:py-3"
              >
                <p className="text-lg font-black text-violet-300 sm:text-2xl">
                  {item.value}
                </p>
                <p className="text-[9px] uppercase tracking-wide text-zinc-500 sm:text-xs">
                  {item.label}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
