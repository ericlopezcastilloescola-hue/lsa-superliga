"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NavIcon } from "@/components/ui/icons";
import { ADMIN_NAV, CAPTAIN_NAV, MAIN_NAV } from "@/lib/constants/navigation";
import { useAuth } from "@/lib/store/auth-context";

const TABS = [
  { href: "/", label: "Inicio", icon: "home", exact: true },
  { href: "/clubes", label: "Clubes", icon: "shield" },
  { href: "/partidos", label: "Partidos", icon: "swords" },
  { href: "/competiciones", label: "Liga", icon: "trophy" },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const pathname = usePathname();
  const { user, logout, isAdmin, isCaptain } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const extraLinks = [
    { href: "/perfil", label: "Mi perfil", icon: "users" },
    ...MAIN_NAV.filter(
      (item) =>
        item.href !== "/perfil" && !TABS.some((t) => t.href === item.href),
    ),
    ...(isCaptain ? CAPTAIN_NAV : []),
    ...(isAdmin ? ADMIN_NAV : []),
  ];

  return (
    <>
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lsa-mobile-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      {menuOpen && (
        <div className="lsa-mobile-menu fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-50 mx-3 max-h-[60vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#12151c] p-3 shadow-2xl">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Menú
          </p>
          <ul className="space-y-0.5">
            {extraLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive(pathname, item.href)
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </Link>
              </li>
            ))}
            {user && (
              <li className="border-t border-white/10 pt-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white"
                >
                  Cerrar sesión
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      <nav
        className="lsa-mobile-nav fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0d1018]/98 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href, tab.exact);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? "text-cyan-400" : "text-zinc-500"
                }`}
              >
                <NavIcon name={tab.icon} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className={`flex flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition-colors ${
              menuOpen || isActive(pathname, "/perfil") || pathname.startsWith("/admin")
                ? "text-cyan-400"
                : "text-zinc-500"
            }`}
          >
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Más</span>
          </button>
        </div>
      </nav>
    </>
  );
}
