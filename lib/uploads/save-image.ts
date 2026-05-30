import { del, put } from "@vercel/blob";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import {
  getBlobConfig,
  getBlobUploadErrorHelp,
  shouldUseBlobStorage,
} from "@/lib/uploads/blob-config";

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
  if (value.includes("blob.vercel-storage.com")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateImageFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Formato no válido. Usa JPG, PNG, WebP o GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen es demasiado grande (máx. 4 MB).");
  }
}

export async function saveUploadedImage(
  file: File,
  subdir: "avatars" | "clubs",
  basename: string,
): Promise<string> {
  validateImageFile(file);

  const ext = EXT_BY_MIME[file.type] ?? "jpg";
  const safeBase = basename.replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `${safeBase}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const blobPath = `uploads/${subdir}/${filename}`;

  if (shouldUseBlobStorage()) {
    try {
      const { hasToken, hasStoreId } = getBlobConfig();
      const blob = await put(blobPath, buffer, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false,
        ...(hasToken ? { token: process.env.BLOB_READ_WRITE_TOKEN } : {}),
        ...(hasStoreId ? { storeId: process.env.BLOB_STORE_ID } : {}),
      });
      return blob.url;
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "Error desconocido";
      throw new Error(`Error al subir imagen: ${detail}. ${getBlobUploadErrorHelp()}`);
    }
  }

  if (process.env.VERCEL) {
    throw new Error(getBlobUploadErrorHelp());
  }

  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${subdir}/${filename}`;
}

export async function deleteUploadedImageIfLocal(
  url: string | null | undefined,
): Promise<void> {
  if (!url) return;

  if (url.includes("blob.vercel-storage.com")) {
    try {
      await del(url, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    } catch {
      // ignore missing blobs
    }
    return;
  }

  if (!url.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
  try {
    await unlink(filePath);
  } catch {
    // ignore missing files
  }
}
