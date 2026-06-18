"use client";

import { useCallback, useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { Drawer } from "vaul";
import { getPlatform, useShareSheet, type ShareOption } from "react-sharesheet/headless";

type GalleryAsset = {
  id: string;
  kind: string;
  contentType: string;
  viewUrl: string;
  downloadUrl: string;
};

const SHARE_OPTIONS: ShareOption[] = ["copy", "download", "whatsapp", "instagram", "facebook", "x", "sms", "email"];

function assetFilename(asset: GalleryAsset) {
  if (asset.kind === "video") return "vibo-session.mp4";
  if (asset.contentType.includes("png")) return "vibo-photo.png";
  return "vibo-photo.jpg";
}

function CompactShareButtons({
  asset,
  sharePageUrl,
  shareText,
}: {
  asset: GalleryAsset;
  sharePageUrl: string;
  shareText: string;
}) {
  const shareSheet = useShareSheet({
    shareUrl: sharePageUrl,
    shareText,
    downloadUrl: asset.downloadUrl,
    downloadFilename: assetFilename(asset),
    emailSubject: shareText,
  });

  const actions: Record<ShareOption, () => void> = {
    native: () => void shareSheet.nativeShare(),
    copy: () => void shareSheet.copyLink(),
    download: () => void shareSheet.downloadFile(),
    whatsapp: shareSheet.shareWhatsApp,
    telegram: shareSheet.shareTelegram,
    instagram: shareSheet.shareInstagram,
    facebook: shareSheet.shareFacebook,
    snapchat: shareSheet.shareSnapchat,
    sms: shareSheet.shareSMS,
    email: shareSheet.shareEmail,
    linkedin: shareSheet.shareLinkedIn,
    reddit: shareSheet.shareReddit,
    x: shareSheet.shareX,
    tiktok: shareSheet.shareTikTok,
    threads: shareSheet.shareThreads,
  };

  const labels: Partial<Record<ShareOption, string>> = {
    copy: shareSheet.copied ? "Copied!" : "Copy link",
    download: shareSheet.downloading ? "Saving..." : asset.kind === "video" ? "Save video" : "Save photo",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    facebook: "Facebook",
    x: "X",
    sms: "Text",
    email: "Email",
  };

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-2">
      {SHARE_OPTIONS.map((id) => {
        const platform = getPlatform(id);
        const availability = shareSheet.platformAvailability[id];
        if (!availability.available) return null;
        if (id === "download" && !asset.downloadUrl) return null;

        const Icon = platform.Icon;

        return (
          <button
            key={id}
            type="button"
            onClick={actions[id]}
            className="flex w-[4.25rem] flex-col items-center gap-1"
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: platform.colors.bg, color: platform.colors.text }}
            >
              <Icon size={18} />
            </span>
            <span className="text-center text-[10px] leading-tight font-medium text-neutral-800">
              {labels[id] ?? platform.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function AssetShareMenu({
  asset,
  eventName,
  sharePageUrl,
  open,
  onClose,
}: {
  asset: GalleryAsset;
  eventName: string;
  sharePageUrl: string;
  open: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState("");
  const [isSharingFile, setIsSharingFile] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);

  const shareText =
    asset.kind === "video"
      ? `My video from ${eventName}`
      : `My photo from ${eventName}`;

  useEffect(() => {
    if (!open) {
      setStatus("");
      setIsSharingFile(false);
      return;
    }

    setCanShareFiles(typeof navigator.share === "function");
  }, [open]);

  const shareAssetFile = useCallback(async () => {
    setIsSharingFile(true);
    setStatus("");

    try {
      const response = await fetch(asset.viewUrl);
      if (!response.ok) {
        throw new Error("Unable to load this file for sharing");
      }

      const blob = await response.blob();
      const file = new File([blob], assetFilename(asset), {
        type: asset.contentType || blob.type,
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: eventName,
          text: shareText,
          files: [file],
        });
        onClose();
        return;
      }

      if (typeof navigator.share === "function") {
        await navigator.share({
          title: eventName,
          text: shareText,
          url: sharePageUrl,
        });
        onClose();
        return;
      }

      throw new Error("Sharing is not supported on this device");
    } catch (shareError) {
      if (shareError instanceof Error && shareError.name === "AbortError") {
        return;
      }
      setStatus(shareError instanceof Error ? shareError.message : "Unable to share this file");
    } finally {
      setIsSharingFile(false);
    }
  }, [asset, eventName, onClose, sharePageUrl, shareText]);

  return (
    <Drawer.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t border-neutral-200 bg-white outline-none">
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-neutral-300" />

          <div className="px-3 pb-4 pt-1">
            {canShareFiles ? (
              <button
                type="button"
                disabled={isSharingFile}
                onClick={() => void shareAssetFile()}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-950 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                <Share2 size={16} />
                {isSharingFile
                  ? "Preparing..."
                  : asset.kind === "video"
                    ? "Share video to apps"
                    : "Share photo to apps"}
              </button>
            ) : null}

            <CompactShareButtons asset={asset} sharePageUrl={sharePageUrl} shareText={shareText} />

            {status ? <p className="mt-2 text-center text-sm font-medium text-rose-700">{status}</p> : null}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
