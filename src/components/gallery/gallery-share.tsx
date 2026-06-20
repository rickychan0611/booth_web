export type GalleryAsset = {
  id: string;
  kind: string;
  contentType: string;
  viewUrl: string;
  downloadUrl: string;
};

export type NativeShareOutcome = "shared" | "cancelled" | "unsupported";

function assetFilename(asset: GalleryAsset) {
  if (asset.kind === "video") return "vibo-session.mp4";
  if (asset.contentType.includes("png")) return "vibo-photo.png";
  return "vibo-photo.jpg";
}

function shareTextForAsset(asset: GalleryAsset, eventName: string) {
  return asset.kind === "video" ? `My video from ${eventName}` : `My photo from ${eventName}`;
}

export function shareFileUrl(galleryToken: string, assetId: string) {
  return `/api/gallery/${galleryToken}/assets/${assetId}`;
}

export async function loadShareFile(galleryToken: string, asset: GalleryAsset): Promise<File | null> {
  try {
    const response = await fetch(shareFileUrl(galleryToken, asset.id));
    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    return new File([blob], assetFilename(asset), {
      type: asset.contentType || blob.type || "application/octet-stream",
    });
  } catch {
    return null;
  }
}

export async function tryNativeShareAsset({
  asset,
  eventName,
  sharePageUrl,
  shareFile,
}: {
  asset: GalleryAsset;
  eventName: string;
  sharePageUrl: string;
  shareFile?: File | null;
}): Promise<NativeShareOutcome> {
  if (typeof navigator.share !== "function") {
    return "unsupported";
  }

  const shareText = shareTextForAsset(asset, eventName);

  try {
    if (shareFile && navigator.canShare?.({ files: [shareFile] })) {
      await navigator.share({
        title: eventName,
        text: shareText,
        files: [shareFile],
      });
      return "shared";
    }

    await navigator.share({
      title: eventName,
      text: shareText,
      url: sharePageUrl,
    });
    return "shared";
  } catch (shareError) {
    if (shareError instanceof Error && shareError.name === "AbortError") {
      return "cancelled";
    }
    return "unsupported";
  }
}
