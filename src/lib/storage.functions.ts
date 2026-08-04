import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const FOLDERS = ["products", "banners", "categories"] as const;
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

interface UploadRequest {
  folder: string;
  fileName: string;
  contentType: string;
  size: number;
}

/**
 * Server-side upload validation. The browser cannot bypass these checks:
 * the object path (including its extension) is issued here, and storage
 * write access is admin-only via RLS.
 */
export const requestUploadPath = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: UploadRequest) => input)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Only administrators can upload store media.");

    const folder = FOLDERS.find((f) => f === data.folder);
    if (!folder) throw new Error("Unsupported upload destination.");

    const ext = MIME_EXT[(data.contentType || "").toLowerCase()];
    if (!ext) {
      throw new Error("Unsupported image format. Please use JPG, PNG, WebP, AVIF or GIF.");
    }

    if (!Number.isFinite(data.size) || data.size <= 0) {
      throw new Error("That file appears to be empty. Please choose another image.");
    }
    if (data.size > MAX_UPLOAD_BYTES) {
      throw new Error(
        `Image is too large (${(data.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`,
      );
    }

    const stem = (data.fileName || "image")
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "image";

    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      path: `${folder}/${stem}-${unique}.${ext}`,
      cacheControl: "31536000",
    };
  });
