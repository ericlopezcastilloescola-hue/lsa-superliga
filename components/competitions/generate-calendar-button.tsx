"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Competition } from "@/lib/types";
import { useData } from "@/lib/store/data-context";
import { useAuth } from "@/lib/store/auth-context";
import { useConfirm } from "@/lib/store/confirm-context";

type Props = {
  comp: Competition;
  className?: string;
  size?: "default" | "large";
};

export function GenerateCalendarButton({
  comp,
  className = "",
  size = "default",
}: Props) {
  const { isAdmin } = useAuth();
  const { generateCompetitionCalendar } = useData();
  const { askConfirm } = useConfirm();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin) return null;

  async function handleGenerate() {
    setError(null);
    if (comp.clubIds.length < 2) {
      setError("Inscribe al menos 2 equipos antes de generar el calendario.");
      return;
    }
    const msg = comp.calendarGenerated
      ? "¿Regenerar calendario? Se borrarán rondas y partidos actuales."
      : "¿Generar calendario con todas las rondas según equipos y fases?";
    const ok = await askConfirm({
      title: comp.calendarGenerated ? "Regenerar calendario" : "Generar calendario",
      message: msg,
      variant: "primary",
      confirmLabel: "Sí",
      cancelLabel: "No",
    });
    if (!ok) return;

    setBusy(true);
    try {
      await generateCompetitionCalendar(comp.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al generar calendario");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <Button
        disabled={busy || comp.clubIds.length < 2}
        onClick={handleGenerate}
        className={size === "large" ? "px-6 py-3 text-base" : undefined}
      >
        {busy
          ? "Generando…"
          : comp.calendarGenerated
            ? "Regenerar calendario"
            : "Generar calendario"}
      </Button>
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
      {comp.clubIds.length < 2 && (
        <p className="mt-2 text-xs text-amber-400">
          Necesitas al menos 2 equipos inscritos.
        </p>
      )}
    </div>
  );
}
