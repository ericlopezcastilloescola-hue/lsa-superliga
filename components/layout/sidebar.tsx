"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LeagueLogo } from "@/components/brand/league-logo";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { NavIcon } from "@/components/ui/icons";
import { ADMIN_NAV, CAPTAIN_NAV, MAIN_NAV } from "@/lib/constants/navigation";
import { useAuth } from "@/lib/store/auth-context";

function NavSection({ items }: { items: typeof MAIN_NAV }) {
  const pathname = usePathname();
  let lastSection = "";

  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const showSection = item.section && item.section !== lastSection;
        if (item.section) lastSection = item.section;
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <li key={item.href}>
            {showSection && (
              <p className="mb-2 mt-5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 first:mt-0">
                {item.section}
              </p>
            )}
            <Link
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-cyan-500/10 text-cyan-400 shadow-[inset_3px_0_0_0_#00f0ff]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              }`}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar() {
  const { user, logout, isAdmin, isCaptain } = useAuth();

  return (
    <aside className="lsa-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-[#0d1018]/95 backdrop-blur-xl">
      <div className="border-b border-white/10 px-5 py-6">
        <Link href="/" className="group block">
          <div className="flex items-center gap-3">
            <LeagueLogo size="md" priority />
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-violet-400/90">
                Clubes Pro
              </p>
              <p className="text-lg font-bold leading-tight text-white group-hover:text-violet-300">
                Superliga
              </p>
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <NavSection items={MAIN_NAV} />
        {isCaptain && <NavSection items={CAPTAIN_NAV} />}
        {isAdmin && <NavSection items={ADMIN_NAV} />}
      </nav>

      <div className="border-t border-white/10 p-4">
        {user && (
          <div className="mb-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
            <Link href="/perfil" className="flex items-center gap-3 hover:opacity-90">
              {user.playerId && user.gamertag ? (
                <PlayerAvatar
                  player={{
                    gamertag: user.gamertag,
                    name: user.playerName ?? user.gamertag,
                    avatarUrl: user.avatarUrl ?? undefined,
                  }}
                  size="sm"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-200">
                  {user.gamertag ?? user.email}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-violet-400">
                  {user.role}
                </p>
              </div>
            </Link>
          </div>
        )}
        <button
          type="button"
          onClick={() => logout()}
          className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
