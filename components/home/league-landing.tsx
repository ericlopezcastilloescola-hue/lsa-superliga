"use client";

import { LeagueLogo } from "@/components/brand/league-logo";
import { SocialLinks } from "@/components/home/social-links";
import { Button } from "@/components/ui/button";

export function LeagueLanding({ isAdmin }: { isAdmin: boolean }) {
  return (
    <section className="mb-6 w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#0c0e14] sm:mb-8">
      {/* Texto superior */}
      <header className="border-b border-white/10 px-6 py-10 text-center sm:px-10 sm:py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          LSA Superliga
        </h1>
        <p className="mt-1 text-lg font-medium text-violet-300/90 sm:text-xl">
          Clubes Pro
        </p>
        <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
          Plataforma oficial de la competición de EA FC Pro Clubs más organizada
          de la comunidad hispana. Temporadas regulares, copas, clasificaciones
          y estadísticas en tiempo real.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-500">
          Referente en Discord para equipos que compiten con seriedad,
          profesionalidad y pasión por el Pro Clubs.
        </p>

        <div className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
          <Button href="/competiciones" className="w-full sm:w-auto">
            Ver competiciones
          </Button>
          <Button href="/estadisticas" variant="secondary" className="w-full sm:w-auto">
            Estadísticas
          </Button>
        </div>

        {isAdmin && (
          <div className="mx-auto mt-6 flex max-w-lg flex-wrap justify-center gap-2 border-t border-white/10 pt-6">
            <Button href="/admin" variant="ghost" className="text-xs">
              Panel Admin
            </Button>
            <Button href="/admin/competiciones" variant="ghost" className="text-xs">
              Competiciones
            </Button>
            <Button href="/admin/clubes" variant="ghost" className="text-xs">
              Clubes
            </Button>
          </div>
        )}
      </header>

      {/* Banner central */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-[#12101a] via-[#0f0a18] to-[#0c0e14] px-6 py-12 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(124,58,237,0.18),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
          aria-hidden
        />
        <div className="relative flex flex-col items-center justify-center">
          <LeagueLogo
            size="hero"
            priority
            className="drop-shadow-[0_0_48px_rgba(124,58,237,0.35)]"
          />
          <p className="mt-6 text-center text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
            Liga · Copas · Comunidad
          </p>
        </div>
      </div>

      {/* Redes inferiores */}
      <footer className="px-6 py-10 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.35em] text-zinc-500">
            Redes oficiales
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Sigue la actualidad de la liga
          </p>
        </div>
        <div className="mx-auto mt-6 max-w-3xl">
          <SocialLinks formal />
        </div>
      </footer>
    </section>
  );
}
