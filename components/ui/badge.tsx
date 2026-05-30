export function Badge({
  children,
  color = "cyan",
}: {
  children: React.ReactNode;
  color?: "cyan" | "pink" | "purple" | "amber" | "green" | "zinc";
}) {
  const colors = {
    cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    pink: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    purple: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    zinc: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}
