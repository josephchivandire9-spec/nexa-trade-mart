import { supabase } from "@/integrations/supabase/client";
import { requestUploadPath } from "./storage.functions";

/** Single source of truth for all store media storage access. */
export const STORAGE_BUCKET = "store-media";

/** Marker used by Supabase public object URLs for this bucket. */
const PUBLIC_MARKER = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;
export const UPLOAD_ACCEPT_ATTR = ACCEPTED_IMAGE_MIME.join(",");

/**
 * Convert any stored reference (legacy absolute public URL, or a relative
 * object path) into the bucket-relative object path. Returns null for
 * external URLs that don't belong to our bucket.
 */
export function toObjectPath(ref?: string | null): string | null {
  if (!ref) return null;
  const value = ref.trim();
  if (!value) return null;

  const marker = value.indexOf(PUBLIC_MARKER);
  if (marker >= 0) {
    const raw = value.slice(marker + PUBLIC_MARKER.length).split("?")[0];
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  if (/^(https?:|data:|blob:)/i.test(value)) return null;
  return value.replace(/^\/+/, "");
}

/**
 * Resolve a stored reference to a displayable URL.
 * Works with both relative object paths (new) and absolute URLs (legacy/external).
 */
export function storageUrl(ref?: string | null): string {
  if (!ref) return "";
  const path = toObjectPath(ref);
  if (!path) return ref;
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export type UploadFolder = "products" | "banners" | "categories";

/**
 * Upload an image. The server validates MIME type, size and extension and
 * issues the object path; the browser then streams the file to storage.
 * Returns the bucket-relative object path (store this in the database).
 */
export async function uploadImage(file: File, folder: UploadFolder): Promise<string> {
  const { path, cacheControl } = await requestUploadPath({
    data: { folder, fileName: file.name, contentType: file.type, size: file.size },
  });

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
    cacheControl,
  });
  if (error) throw new Error(error.message || "Upload failed");
  return path;
}

/**
 * Delete storage objects. Call this only AFTER the database write succeeded,
 * so a failed save can never orphan or destroy a live image.
 */
export async function removeStorageObjects(refs: Array<string | null | undefined>): Promise<void> {
  const paths = Array.from(
    new Set(refs.map((ref) => toObjectPath(ref)).filter((p): p is string => !!p)),
  );
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths);
  if (error) console.warn("[storage] cleanup failed:", error.message);
}
