import type { Player } from "@/lib/types";

export function PlayerAvatar({
  player,
  size = "md",
}: {
  player: Pick<Player, "gamertag" | "avatarUrl" | "name">;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-20 w-20 text-xl",
  };

  if (player.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={player.avatarUrl}
        alt={player.name}
        className={`shrink-0 rounded-full object-cover ring-2 ring-white/10 ${sizes[size]}`}
      />
    );
  }

  const initials = player.gamertag.slice(0, 2).toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-violet-400 font-bold text-white ring-2 ring-white/10 ${sizes[size]}`}
      title={player.gamertag}
    >
      {initials}
    </div>
  );
}
