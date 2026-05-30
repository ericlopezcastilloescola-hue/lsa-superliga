export type NavItem = {
  href: string;
  label: string;
  icon: string;
  section?: string;
};

export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Inicio", icon: "home", section: "Principal" },
  { href: "/perfil", label: "Mi perfil", icon: "users" },
  { href: "/clubes", label: "Clubes", icon: "shield" },
  { href: "/partidos", label: "Partidos", icon: "swords" },
  {
    href: "/competiciones",
    label: "Competiciones",
    icon: "trophy",
    section: "Competiciones",
  },
];

export const CAPTAIN_NAV: NavItem[] = [
  {
    href: "/mi-equipo",
    label: "Mi equipo",
    icon: "shield",
    section: "Capitán",
  },
];

export const ADMIN_NAV: NavItem[] = [
  {
    href: "/admin",
    label: "Panel Admin",
    icon: "settings",
    section: "Administración",
  },
  { href: "/admin/resultados", label: "Resultados", icon: "score" },
  { href: "/admin/competiciones", label: "Competiciones", icon: "plus" },
  { href: "/admin/clubes", label: "Gestionar clubes", icon: "edit" },
  { href: "/admin/jugadores", label: "Todos los jugadores", icon: "users" },
  { href: "/admin/usuarios", label: "Usuarios y cuentas", icon: "users" },
];
