"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Mail, MessageCircle, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type GalleryAsset = {
  id: string;
  kind: string;
  contentType: string;
  viewUrl: string;
  downloadUrl: string;
};

type ShareTarget = {
  id: string;
  label: string;
  icon: typeof Share2;
  action: "file" | "copy" | "href";
  href?: string;
};

function assetFilename(asset: GalleryAsset) {
  if (asset.kind === "video") return "vibo-session.mp4";
  if (asset.contentType.includes("png")) return "vibo-photo.png";
  return "vibo-photo.jpg";
}

function galleryPageUrl() {
  return typeof window === "undefined" ? "" : window.location.href;
}

function buildShareTargets(shareUrl: string, shareText: string, supportsFileShare: boolean): ShareTarget[] {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const targets: ShareTarget[] = [];

  if (supportsFileShare) {
    targets.push({
      id: "file",
      label: "Share photo or video",
      icon: Share2,
      action: "file",
    });
  }

  targets.push(
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      action: "href",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      id: "copy",
      label: "Copy gallery link",
      icon: Copy,
      action: "copy",
    },
    {
      id: "sms",
      label: "Text message",
      icon: MessageCircle,
      action: "href",
      href: `sms:?&body=${encodedText}%20${encodedUrl}`,
    },
    {
      id: "email",
      label: "Email",
      icon: Mail,
      action: "href",
      href: `mailto:?subject=${encodedText}&body=${encodedText}%0A%0A${encodedUrl}`,
    },
  );

  return targets;
}

export function AssetShareMenu({
  asset,
  eventName,
  open,
  onClose,
}: {
  asset: GalleryAsset;
  eventName: string;
  open: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [supportsFileShare, setSupportsFileShare] = useState(false);

  const shareText =
    asset.kind === "video"
      ? `My video from ${eventName}`
      : `My photo from ${eventName}`;

  useEffect(() => {
    if (!open) {
      setStatus("");
      setIsSharing(false);
      return;
    }

    setSupportsFileShare(typeof navigator.share === "function");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const copyGalleryLink = useCallback(async () => {
    const shareUrl = galleryPageUrl();
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setStatus("Gallery link copied");
    window.setTimeout(() => setStatus(""), 2000);
  }, []);

  async function shareAssetFile() {
    setIsSharing(true);
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
          url: galleryPageUrl(),
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
      setIsSharing(false);
    }
  }

  async function handleShare(target: ShareTarget) {
    if (target.action === "file") {
      await shareAssetFile();
      return;
    }

    if (target.action === "copy") {
      await copyGalleryLink();
      return;
    }

    if (target.href) {
      window.location.href = target.href;
      onClose();
    }
  }

  if (!open) return null;

  const targets = buildShareTargets(galleryPageUrl(), shareText, supportsFileShare);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close share menu"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />
      <section className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-4 pb-6 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Share</h2>
            <p className="text-sm text-neutral-600">
              {asset.kind === "video" ? "Send this video" : "Send this photo"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {targets.map((target) => {
            const Icon = target.icon;
            return (
              <Button
                key={target.id}
                type="button"
                variant="secondary"
                className="h-auto min-h-11 flex-col gap-1 py-3 text-xs"
                disabled={isSharing}
                onClick={() => handleShare(target)}
              >
                <Icon size={18} />
                {target.id === "file" && isSharing ? "Preparing..." : target.label}
              </Button>
            );
          })}
        </div>

        {status ? <p className="mt-3 text-sm font-medium text-emerald-700">{status}</p> : null}
      </section>
    </div>
  );
}
