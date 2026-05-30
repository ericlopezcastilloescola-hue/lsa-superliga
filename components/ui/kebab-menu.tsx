"use client";

import { useState } from "react";

export type KebabMenuItem = {
  label: string;
  onClick: () => void;
  danger?: boolean;
  dividerBefore?: boolean;
};

export function KebabMenu({
  items,
  align = "right",
  theme = "light",
  ariaLabel = "Más opciones",
}: {
  items: KebabMenuItem[];
  align?: "left" | "right";
  theme?: "light" | "dark";
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  const btnClass =
    theme === "light"
      ? "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
      : "text-zinc-400 hover:bg-white/10 hover:text-white";

  const panelClass =
    theme === "light"
      ? "border-zinc-200 bg-white shadow-lg"
      : "border-white/10 bg-[#1a1d26] shadow-2xl";

  const itemClass = (danger?: boolean) =>
    theme === "light"
      ? danger
        ? "text-rose-600 hover:bg-rose-50"
        : "text-zinc-800 hover:bg-zinc-100"
      : danger
        ? "text-rose-300 hover:bg-rose-500/10"
        : "text-zinc-100 hover:bg-white/5";

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${btnClass}`}
        aria-label={ariaLabel}
      >
        <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor" aria-hidden>
          <circle cx="2" cy="2" r="2" />
          <circle cx="2" cy="8" r="2" />
          <circle cx="2" cy="14" r="2" />
        </svg>
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 cursor-default"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />
          <div
            className={`absolute top-full z-[60] mt-1 min-w-[280px] overflow-hidden rounded-md border py-1 ${panelClass} ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {items.map((item) => (
              <div key={item.label}>
                {item.dividerBefore && (
                  <div className={`my-1 border-t ${theme === "light" ? "border-zinc-200" : "border-white/10"}`} />
                )}
                <button
                  type="button"
                  className={`block w-full px-4 py-3 text-left text-sm transition-colors ${itemClass(item.danger)}`}
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
