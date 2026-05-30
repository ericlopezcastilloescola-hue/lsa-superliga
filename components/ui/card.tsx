import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-[#12151c]/90 backdrop-blur-sm ${
        glow ? "shadow-[0_0_30px_rgba(0,240,255,0.08)]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-white/5 px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
      <div className="min-w-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 sm:text-sm">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[11px] text-zinc-500 sm:text-xs">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-3 sm:p-5 ${className}`}>{children}</div>;
}
