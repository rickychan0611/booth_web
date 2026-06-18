import { createPresignedGetUrl } from "@/lib/r2/urls";
import type { PhotoKind } from "@/types/database";

const GALLERY_KIND_ORDER: Record<PhotoKind, number> = {
  layout: 0,
  video: 1,
  original: 2,
  thumbnail: 3,
};

type GalleryAssetRow = {
  id: string;
  kind: string;
  content_type: string;
  r2_key: string;
  width?: number | null;
  height?: number | null;
};

export function sortGalleryAssets<T extends { kind: string }>(assets: T[]) {
  return [...assets].sort((left, right) => {
    const leftOrder = GALLERY_KIND_ORDER[left.kind as PhotoKind] ?? 99;
    const rightOrder = GALLERY_KIND_ORDER[right.kind as PhotoKind] ?? 99;
    return leftOrder - rightOrder;
  });
}

export async function serializeGalleryAssets(assets: GalleryAssetRow[]) {
  const sortedAssets = sortGalleryAssets(assets);

  return Promise.all(
    sortedAssets.map(async (asset) => ({
      id: asset.id,
      kind: asset.kind,
      contentType: asset.content_type,
      width: asset.width ?? null,
      height: asset.height ?? null,
      viewUrl: await createPresignedGetUrl(asset.r2_key),
      downloadUrl: await createPresignedGetUrl(asset.r2_key),
    })),
  );
}
