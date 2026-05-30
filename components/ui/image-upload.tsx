"use client";

import { useRef, useState, type ReactNode } from "react";

type Props = {
  label: string;
  hint?: string;
  uploadUrl: string;
  extraFields?: Record<string, string>;
  previewUrl?: string | null;
  previewFallback?: ReactNode;
  shape?: "circle" | "rounded";
  onUploaded: (url: string) => void | Promise<void>;
};

export function ImageUpload({
  label,
  hint = "JPG, PNG, WebP o GIF · máx. 4 MB",
  uploadUrl,
  extraFields,
  previewUrl,
  previewFallback,
  shape = "circle",
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const displayUrl = localPreview ?? previewUrl;

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);

    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (extraFields) {
        for (const [key, value] of Object.entries(extraFields)) {
          formData.append(key, value);
        }
      }

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? "Error al subir la imagen");
      }

      URL.revokeObjectURL(preview);
      setLocalPreview(null);
      await onUploaded(body.url as string);
    } catch (err) {
      URL.revokeObjectURL(preview);
      setLocalPreview(null);
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const shapeClass =
    shape === "circle" ? "rounded-full" : "rounded-xl";

  return (
    <div className="space-y-3">
      <span className="block text-xs font-medium text-zinc-400">{label}</span>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div
          className={`flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white/5 ${shapeClass}`}
        >
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayUrl}
              alt="Vista previa"
              className="h-full w-full object-cover"
            />
          ) : (
            previewFallback ?? (
              <span className="text-xs text-zinc-600">Sin imagen</span>
            )
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 py-2.5 text-sm font-medium text-violet-200 transition-colors hover:bg-violet-500/20 disabled:opacity-50"
          >
            {uploading ? "Subiendo…" : "Elegir imagen del escritorio"}
          </button>
          <p className="text-xs text-zinc-500">{hint}</p>
          {error && (
            <p className="text-xs text-rose-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
