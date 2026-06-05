"use client";

import { useCallback, useMemo, useState } from "react";
import { Copy, Link2, Mail, MessageCircle, Send, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ShareTarget = {
  id: string;
  label: string;
  icon: typeof Share2;
  href?: string;
  action?: "native" | "copy";
};

function currentShareUrl() {
  return typeof window === "undefined" ? "" : window.location.href;
}

function buildShareTargets(shareUrl: string, shareText: string): ShareTarget[] {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  return [
    {
      id: "native",
      label: "Share",
      icon: Share2,
      action: "native",
    },
    {
      id: "copy",
      label: "Copy link",
      icon: Copy,
      action: "copy",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      id: "messenger",
      label: "Messenger",
      icon: MessageCircle,
      href: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=0&redirect_uri=${encodedUrl}`,
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: Link2,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      id: "twitter",
      label: "X",
      icon: Link2,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: Link2,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      id: "telegram",
      label: "Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      id: "sms",
      label: "Text message",
      icon: MessageCircle,
      href: `sms:?&body=${encodedText}%20${encodedUrl}`,
    },
    {
      id: "email",
      label: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodedText}&body=${encodedText}%0A%0A${encodedUrl}`,
    },
  ];
}

export function GalleryShare({ eventName }: { eventName: string }) {
  const [status, setStatus] = useState("");
  const shareText = useMemo(() => `My photos from ${eventName}`, [eventName]);

  const copyLink = useCallback(async () => {
    const shareUrl = currentShareUrl();
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setStatus("Link copied");
    window.setTimeout(() => setStatus(""), 2000);
  }, []);

  async function handleShare(target: ShareTarget) {
    const shareUrl = currentShareUrl();
    if (!shareUrl) return;

    if (target.action === "copy") {
      await copyLink();
      return;
    }

    if (target.action === "native" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: eventName, text: shareText, url: shareUrl });
        return;
      } catch (shareError) {
        if (shareError instanceof Error && shareError.name === "AbortError") {
          return;
        }
      }
    }

    if (target.href) {
      window.open(target.href, "_blank", "noopener,noreferrer,width=640,height=720");
    }
  }

  const targets = buildShareTargets(currentShareUrl(), shareText);

  return (
    <section className="w-full max-w-md rounded-md bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold">Share your gallery</h2>
      <p className="mt-1 text-sm text-neutral-600">Send your photos and video to friends and family.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {targets.map((target) => {
          const Icon = target.icon;
          const hideNative = target.id === "native" && typeof navigator.share !== "function";
          if (hideNative) return null;

          return (
            <Button
              key={target.id}
              type="button"
              variant="secondary"
              className="h-auto min-h-11 flex-col gap-1 py-2 text-xs"
              onClick={() => handleShare(target)}
            >
              <Icon size={18} />
              {target.label}
            </Button>
          );
        })}
      </div>
      {status ? <p className="mt-3 text-sm font-medium text-emerald-700">{status}</p> : null}
    </section>
  );
}
