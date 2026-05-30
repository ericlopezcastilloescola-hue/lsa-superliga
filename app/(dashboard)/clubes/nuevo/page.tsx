"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { useData } from "@/lib/store/data-context";

const COLORS = ["#00f0ff", "#ff3366", "#7c3aed", "#f59e0b", "#10b981", "#3b82f6"];

export default function NuevoClubPage() {
  const { createClub } = useData();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [crestColor, setCrestColor] = useState(COLORS[0]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleLogoPick(file: File) {
    setLogoFile(file);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function uploadLogo(clubId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("clubId", clubId);
    const res = await fetch("/api/upload/club-logo", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Error al subir el logo");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const id = await createClub({
        name: String(fd.get("name")),
        crestColor,
      });
      if (logoFile) {
        await uploadLogo(id, logoFile);
      }
      router.push(`/clubes/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el club");
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Crear equipo"
        description="Nombre, logo opcional y color del escudo."
      />
      <Card className="max-w-xl">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nombre del equipo" name="name" required />

            <div className="space-y-3">
              <span className="block text-xs font-medium text-zinc-400">
                Logo del equipo (opcional)
              </span>
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreview}
                      alt="Vista previa"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-zinc-600">Sin logo</span>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoPick(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-200 hover:bg-violet-500/20"
                  >
                    Elegir imagen del escritorio
                  </button>
                  <p className="mt-2 text-xs text-zinc-500">
                    JPG, PNG, WebP o GIF · máx. 4 MB
                  </p>
                </div>
              </div>
            </div>

            <div>
              <span className="mb-2 block text-xs font-medium text-zinc-400">
                Color del escudo (si no hay logo)
              </span>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCrestColor(c)}
                    className={`h-8 w-8 rounded-lg border-2 transition-transform ${
                      crestColor === c ? "scale-110 border-white" : "border-transparent"
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creando…" : "Crear equipo"}
              </Button>
              <Button href="/clubes" variant="secondary">
                Cancelar
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
