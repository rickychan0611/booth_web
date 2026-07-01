export type EventBranding = {
  galleryBannerR2Key?: string;
  galleryBannerContentType?: string;
  galleryBannerLinkUrl?: string;
};

export function readEventBranding(value: unknown): EventBranding {
  if (!value || typeof value !== "object") {
    return {};
  }

  const branding = value as Record<string, unknown>;

  return {
    galleryBannerR2Key:
      typeof branding.galleryBannerR2Key === "string" ? branding.galleryBannerR2Key : undefined,
    galleryBannerContentType:
      typeof branding.galleryBannerContentType === "string"
        ? branding.galleryBannerContentType
        : undefined,
    galleryBannerLinkUrl:
      typeof branding.galleryBannerLinkUrl === "string" ? branding.galleryBannerLinkUrl : undefined,
  };
}

export function mergeEventBranding(
  current: unknown,
  patch: Partial<EventBranding>,
): EventBranding {
  return {
    ...readEventBranding(current),
    ...patch,
  };
}

export function clearGalleryBannerBranding(current: unknown): EventBranding {
  const branding = readEventBranding(current);
  const next = { ...branding };
  delete next.galleryBannerR2Key;
  delete next.galleryBannerContentType;
  return next;
}
