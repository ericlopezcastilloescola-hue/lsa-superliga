export const SOCIAL_LINKS = {
  discord: {
    label: "Discord",
    href: "https://discord.gg/Y37tNvjm",
    handle: "Comunidad LSA",
    description: "Inscripciones, convocatorias y chat en directo",
    color: "from-[#5865F2] to-[#4752C4]",
    icon: "discord" as const,
  },
  x: {
    label: "X (Twitter)",
    href: "https://x.com/LSA__SPAIN",
    handle: "@LSA__SPAIN",
    description: "Noticias, resultados y clips de la liga",
    color: "from-zinc-700 to-zinc-900",
    icon: "x" as const,
  },
  tiktok: {
    label: "TikTok",
    href: "https://www.tiktok.com/@lsa_spain",
    handle: "@lsa_spain",
    description: "Highlights, goles y momentos épicos",
    color: "from-[#00f2ea] to-[#ff0050]",
    icon: "tiktok" as const,
  },
} as const;

export const SOCIAL_LIST = [
  SOCIAL_LINKS.discord,
  SOCIAL_LINKS.x,
  SOCIAL_LINKS.tiktok,
];
