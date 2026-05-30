"use client";

import { LeagueLogo } from "@/components/brand/league-logo";
import { SocialLinks } from "@/components/home/social-links";
import { Button } from "@/components/ui/button";
import { SITE_DOMAIN } from "@/lib/config/site";

const HIGHLIGHTS = [
  "Liga oficial Clubes Pro",
  "Copas y eliminatorias",
  "Estadísticas en vivo",
  "Comunidad activa en Discord",
] as const;

export function LeagueLanding({ isAdmin }: { isAdmin: boolean }) {
  return (
    <section className="relative mb-6 w-full min-w-0 overflow-hidden rounded-2xl border border-violet-500/25 bg-[#0d1018] sm:mb-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(124,58,237,0.35),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-violet-600/15 blur-3xl"
        aria-hidden
      />

      <div className="relative p-5 sm:p-10 lg:p-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <div className="flex shrink-0 flex-col items-center text-center lg:items-start lg:text-left">
            <LeagueLogo size="hero" priority className="mx-auto lg:mx-0" />
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400 sm:text-xs">
              {SITE_DOMAIN}
            </p>
          </div>

          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-300 sm:text-xs">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              La mejor liga de Clubes Pro en Discord
            </p>

            <h1 className="mt-4 text-2xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              LSA Superliga
              <span className="mt-1 block bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Clubes Pro
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Bienvenido a la plataforma oficial de la{" "}
              <strong className="font-semibold text-zinc-200">
                LSA Superliga
              </strong>
              : la competición de EA FC Pro Clubs más competitiva y organizada de
              la comunidad hispana. Temporadas completas, copas, rankings de
              goleadores y asistentes, y un ecosistema pensado para equipos que
              compiten en serio.
            </p>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
              Nacida en Discord y hecha por jugadores, para jugadores. Aquí
              encuentras tu club, sigues la liga, consultas resultados y formas
              parte de una de las ligas Pro Clubs más activas del mundo.
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300"
                >
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
              <Button href="/estadisticas" className="w-full sm:w-auto">
                Goleadores y asistencias
              </Button>
              <Button href="/competiciones" variant="secondary" className="w-full sm:w-auto">
                Ver competiciones
              </Button>
              <a
                href="https://discord.gg/Y37tNvjm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#4752C4] sm:w-auto"
              >
                Unirse al Discord
              </a>
            </div>

            {isAdmin && (
              <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                <Button href="/admin" variant="secondary">
                  Panel Admin
                </Button>
                <Button href="/admin/competiciones" variant="ghost">
                  Competiciones
                </Button>
                <Button href="/admin/clubes" variant="ghost">
                  Clubes
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-2xl border border-violet-500/30 sm:mt-10">
          <div
            className="absolute inset-0 bg-gradient-to-r from-violet-950 via-[#1a0a2e] to-violet-900"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(124,58,237,0.45),transparent_55%)]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(0,240,255,0.12),transparent_45%)]"
            aria-hidden
          />
          <div
            className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-400 via-violet-500 to-fuchsia-500"
            aria-hidden
          />
          <div className="relative flex flex-col items-center justify-center gap-4 px-6 py-10 sm:flex-row sm:gap-10 sm:py-12">
            <LeagueLogo
              size="xl"
              priority
              className="drop-shadow-[0_0_32px_rgba(168,85,247,0.55)]"
            />
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400/90 sm:text-xs">
                LSA Superliga
              </p>
              <p className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Clubes Pro
              </p>
              <p className="mt-2 max-w-xs text-sm text-violet-200/70">
                Competición oficial · Temporada activa
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-10">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-widest text-zinc-500">
            Síguenos
          </h2>
          <p className="mb-4 text-xs text-zinc-600">
            Resultados, clips y novedades de la liga
          </p>
          <SocialLinks />
        </div>
      </div>
    </section>
  );
}
