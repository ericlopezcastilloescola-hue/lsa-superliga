"use client";

import type { ReactNode } from "react";
import { LeagueLogo } from "@/components/brand/league-logo";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full max-w-[100vw] flex-col bg-[#0B0E14]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-600/8 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-fuchsia-600/6 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-rose-500/5 blur-3xl" />
      </div>

      {/* Sidebar solo en escritorio */}
      <Sidebar />

      {/* Cabecera móvil */}
      <header className="sticky top-0 z-20 flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#0d1018]/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <LeagueLogo size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">LSA Superliga</p>
          <p className="text-[10px] uppercase tracking-wider text-violet-400/90">
            Clubes Pro
          </p>
        </div>
      </header>

      <main className="relative min-w-0 flex-1 w-full lg:pl-64">
        <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-8 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-8">
          {children}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
