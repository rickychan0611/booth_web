import { normalizeContentType, safeUploadFilename } from "@/lib/uploads/assets";

export const MAX_GALLERY_BANNER_BYTES = 5 * 1024 * 1024;

const GALLERY_BANNER_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function isAllowedGalleryBannerContentType(contentType: string) {
  const normalized = normalizeContentType(contentType);
  return GALLERY_BANNER_CONTENT_TYPES.includes(
    normalized as (typeof GALLERY_BANNER_CONTENT_TYPES)[number],
  );
}

export function buildGalleryBannerKey(eventId: string, filename: string) {
  const safeName = safeUploadFilename(filename);
  const extension = safeName.includes(".") ? safeName.split(".").pop() : "jpg";
  return `events/${eventId}/gallery-banner.${extension ?? "jpg"}`;
}
