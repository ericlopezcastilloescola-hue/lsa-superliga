import type { Club } from "@/lib/types";

export function ClubCrest({
  club,
  size = "md",
}: {
  club: Pick<Club, "tag" | "crestColor" | "name" | "logoUrl">;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-16 w-16 text-lg",
    xl: "h-14 w-14 text-base",
  };

  if (club.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={club.logoUrl}
        alt={club.name}
        className={`shrink-0 rounded-lg object-cover ${sizes[size]}`}
        title={club.name}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg font-bold text-black shadow-lg ${sizes[size]}`}
      style={{
        background: `linear-gradient(135deg, ${club.crestColor}, ${club.crestColor}88)`,
        boxShadow: `0 0 20px ${club.crestColor}40`,
      }}
      title={club.name}
    >
      {club.tag}
    </div>
  );
}
