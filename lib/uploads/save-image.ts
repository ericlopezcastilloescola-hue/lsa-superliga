import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 4 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function isValidImageRef(value: string): boolean {
  if (value.startsWith("/uploads/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function saveUploadedImage(
  file: File,
  subdir: "avatars" | "clubs",
  basename: string,
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Formato no válido. Usa JPG, PNG, WebP o GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen es demasiado grande (máx. 4 MB).");
  }

  const ext = EXT_BY_MIME[file.type] ?? "jpg";
  const safeBase = basename.replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `${safeBase}-${Date.now()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${subdir}/${filename}`;
}

export async function deleteUploadedImageIfLocal(
  url: string | null | undefined,
): Promise<void> {
  if (!url?.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
  try {
    await unlink(filePath);
  } catch {
    // ignore missing files
  }
}
