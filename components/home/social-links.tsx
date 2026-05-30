import { SOCIAL_LIST } from "@/lib/config/social";

function SocialIcon({ name }: { name: "discord" | "x" | "tiktok" }) {
  const cn = "h-5 w-5 shrink-0";
  if (name === "discord") {
    return (
      <svg className={cn} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037 12.3 12.3 0 00-.608 1.25 18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    );
  }
  if (name === "x") {
    return (
      <svg className={cn} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  return (
    <svg className={cn} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
    </svg>
  );
}

export function SocialLinks({
  compact = false,
  formal = false,
}: {
  compact?: boolean;
  formal?: boolean;
}) {
  if (formal) {
    return (
      <div className="divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10">
        {SOCIAL_LIST.map((social) => (
          <a
            key={social.href}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 bg-white/[0.02] px-5 py-4 transition-colors hover:bg-white/[0.05] sm:px-6"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#0c0e14] text-zinc-400 transition-colors group-hover:border-violet-500/30 group-hover:text-violet-300">
              <SocialIcon name={social.icon} />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-sm font-medium text-zinc-200">
                {social.label}
              </span>
              <span className="block text-xs text-zinc-500">{social.handle}</span>
            </span>
            <span className="shrink-0 text-xs text-zinc-600 transition-colors group-hover:text-violet-400">
              →
            </span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "flex flex-wrap gap-2"
          : "grid gap-3 sm:grid-cols-3 sm:gap-4"
      }
    >
      {SOCIAL_LIST.map((social) => (
        <a
          key={social.href}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={
            compact
              ? `inline-flex items-center gap-2 rounded-lg bg-gradient-to-r ${social.color} px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]`
              : `group flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-white/20 hover:bg-white/[0.06] sm:p-5`
          }
        >
          {compact ? (
            <>
              <SocialIcon name={social.icon} />
              {social.label}
            </>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${social.color} text-white shadow-lg`}
                >
                  <SocialIcon name={social.icon} />
                </div>
                <span className="text-xs font-medium text-zinc-500 group-hover:text-violet-300">
                  Seguir →
                </span>
              </div>
              <p className="font-bold text-white">{social.label}</p>
              <p className="text-sm text-violet-300">{social.handle}</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                {social.description}
              </p>
            </>
          )}
        </a>
      ))}
    </div>
  );
}
