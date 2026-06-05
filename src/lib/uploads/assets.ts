import type { PhotoKind } from "@/types/database";

/** Direct multipart uploads through Next.js (self-hosted / dev). Presigned PUT bypasses this. */
export const MAX_DIRECT_UPLOAD_BYTES = 100 * 1024 * 1024;

const IMAGE_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const VIDEO_CONTENT_TYPES = ["video/mp4", "video/webm"] as const;

const CONTENT_TYPES_BY_KIND: Record<PhotoKind, readonly string[]> = {
  original: IMAGE_CONTENT_TYPES,
  layout: IMAGE_CONTENT_TYPES,
  thumbnail: IMAGE_CONTENT_TYPES,
  video: VIDEO_CONTENT_TYPES,
};

const DEFAULT_EXTENSIONS: Record<PhotoKind, string> = {
  original: "jpg",
  layout: "jpg",
  thumbnail: "jpg",
  video: "mp4",
};

export function safeUploadFilename(filename: string) {
  return filename.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
}

export function defaultUploadFilename(kind: PhotoKind) {
  return `${kind}.${DEFAULT_EXTENSIONS[kind]}`;
}

export function normalizeContentType(contentType: string) {
  return contentType.split(";")[0]?.trim().toLowerCase() ?? "";
}

export function isAllowedUploadContentType(kind: PhotoKind, contentType: string) {
  const normalized = normalizeContentType(contentType);
  return CONTENT_TYPES_BY_KIND[kind].includes(normalized);
}

export function parseOptionalDimensions(widthRaw: string, heightRaw: string) {
  const width = parseOptionalDimension(widthRaw);
  const height = parseOptionalDimension(heightRaw);
  return { width, height };
}

export function normalizeOptionalDimension(value: number | undefined | null) {
  if (value === undefined || value === null || value === 0) {
    return null;
  }
  return Number.isInteger(value) && value > 0 ? value : null;
}

function parseOptionalDimension(value: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function buildR2AssetKey(input: {
  eventId: string;
  ticketId: string;
  kind: PhotoKind;
  filename: string;
  index?: number;
}) {
  const safeName = safeUploadFilename(input.filename);
  const prefix =
    input.kind === "video"
      ? `events/${input.eventId}/tickets/${input.ticketId}/videos`
      : `events/${input.eventId}/tickets/${input.ticketId}`;

  if (input.index !== undefined) {
    const order = String(input.index + 1).padStart(3, "0");
    return `${prefix}/${order}-${input.kind}-${safeName}`;
  }

  return `${prefix}/${Date.now()}-${input.kind}-${safeName}`;
}
