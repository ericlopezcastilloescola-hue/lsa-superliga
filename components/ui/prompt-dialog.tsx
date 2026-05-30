"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export type PromptDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  label?: string;
  defaultValue?: string;
  inputType?: "text" | "date" | "datetime-local";
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
};

export function PromptDialog({
  open,
  title,
  message,
  label,
  defaultValue = "",
  inputType = "text",
  confirmLabel = "Guardar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setValue(defaultValue);
  }, [open, defaultValue]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <form
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#12151c] p-6 shadow-2xl shadow-black/50"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(value);
        }}
      >
        {title ? (
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        ) : null}
        {message ? (
          <p className={`text-sm text-zinc-400 ${title ? "mt-2" : ""}`}>{message}</p>
        ) : null}
        <div className={title || message ? "mt-4" : ""}>
          {label ? (
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                {label}
              </span>
              <input
                ref={inputRef}
                name="promptValue"
                type={inputType}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              />
            </label>
          ) : (
            <input
              ref={inputRef}
              name="promptValue"
              type={inputType}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
          )}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="submit" variant="primary">
            {confirmLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
