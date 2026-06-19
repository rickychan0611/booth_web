"use client";

import { Download, Film, ImageIcon, Share2, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { GalleryFooter, GalleryHeader } from "@/components/gallery/gallery-chrome";
import { AssetShareMenu } from "@/components/gallery/gallery-share";
import { Button } from "@/components/ui/button";

type GalleryAsset = {
  id: string;
  kind: string;
  contentType: string;
  viewUrl: string;
  downloadUrl: string;
};

function isVideoAsset(asset: GalleryAsset) {
  return asset.kind === "video" || asset.contentType.startsWith("video/");
}

function namePromptSkipKey(galleryToken: string) {
  return `gallery-name-skipped:${galleryToken}`;
}

export function GalleryClient({
  galleryToken,
  sharePageUrl,
}: {
  galleryToken: string;
  sharePageUrl: string;
}) {
  const [eventName, setEventName] = useState("Photo gallery");
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [shareAssetId, setShareAssetId] = useState<string | null>(null);
  const [enlargedAssetId, setEnlargedAssetId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameError, setNameError] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const shareAsset = assets.find((asset) => asset.id === shareAssetId) ?? null;
  const enlargedAsset = assets.find((asset) => asset.id === enlargedAssetId) ?? null;
  const isNamePromptBlocking = nameModalOpen && !isLoading && !error;

  useEffect(() => {
    if (!isNamePromptBlocking) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isNamePromptBlocking]);

  useEffect(() => {
    async function loadGallery() {
      try {
        const response = await fetch(`/api/gallery/${galleryToken}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Gallery not found");
        }

        setEventName(data.event.name);
        setBannerUrl(data.event.bannerUrl ?? null);
        setAssets(data.assets);
        setQueueNumber(data.ticket?.queueNumber ?? null);
        const savedName = data.ticket?.name?.trim() ?? "";
        setNameInput(savedName);
        const skippedNamePrompt =
          typeof window !== "undefined" &&
          sessionStorage.getItem(namePromptSkipKey(galleryToken)) === "1";
        setNameModalOpen(!savedName && !skippedNamePrompt);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Gallery not found");
      } finally {
        setIsLoading(false);
      }
    }

    loadGallery();
  }, [galleryToken]);

  async function saveGuestName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = nameInput.trim();
    if (!nextName) {
      setNameError("Please enter your name.");
      return;
    }

    try {
      setIsSavingName(true);
      setNameError("");
      const response = await fetch(`/api/gallery/${galleryToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not save your name.");
      }
      setNameModalOpen(false);
    } catch (saveError) {
      setNameError(saveError instanceof Error ? saveError.message : "Could not save your name.");
    } finally {
      setIsSavingName(false);
    }
  }

  function skipGuestName() {
    setNameError("");
    try {
      sessionStorage.setItem(namePromptSkipKey(galleryToken), "1");
    } catch {
      // Ignore storage errors (private browsing, etc.)
    }
    setNameModalOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 text-neutral-950">
      <div className="flex min-h-screen flex-col" inert={isNamePromptBlocking ? true : undefined}>
      <GalleryHeader />

      {bannerUrl ? (
        <div className="bg-neutral-100 px-4 pt-4">
          <div className="mx-auto h-[200px] w-full max-w-[600px] overflow-hidden rounded-md bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerUrl}
              alt={`${eventName} banner`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      ) : null}

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-bold">{eventName}</h1>
          </header>

          {isLoading ? <p className="mt-8 text-neutral-600">Loading your gallery...</p> : null}
          {error ? <p className="mt-8 rounded-md bg-rose-50 p-4 text-rose-800">{error}</p> : null}

          {!isLoading && !error && assets.length === 0 ? (
            <section className="mt-8 rounded-md bg-white p-8 text-center shadow-sm">
              <ImageIcon className="mx-auto text-neutral-400" size={42} />
              <h2 className="mt-3 text-xl font-bold">Photos are still processing</h2>
              <p className="mt-2 text-neutral-600">
                Refresh this page in a moment after the booth finishes uploading.
              </p>
            </section>
          ) : null}

          <section className="grid w-full max-w-md gap-5">
            {assets.map((asset) => (
              <article key={asset.id} className="overflow-hidden rounded-md bg-white shadow-sm">
                {!isVideoAsset(asset) && queueNumber !== null ? (
                  <p className="px-3 pt-2 text-xs font-medium text-neutral-500">Photo #{queueNumber}</p>
                ) : null}
                {isVideoAsset(asset) ? (
                  <div className="bg-neutral-950">
                    <video
                      className="aspect-video w-full"
                      controls
                      playsInline
                      preload="metadata"
                      src={asset.viewUrl}
                    >
                      <track kind="captions" />
                    </video>
                    <p className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white">
                      <Film size={16} />
                      Session video
                    </p>
                  </div>
                ) : asset.contentType.startsWith("image/") ? (
                  <button
                    type="button"
                    className="block w-full bg-white"
                    onClick={() => setEnlargedAssetId(asset.id)}
                    aria-label="Open image full screen"
                  >
                    {/* Presigned R2 URLs are not compatible with next/image optimization. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.viewUrl} alt="Photo booth layout" className="h-auto w-full object-contain" />
                  </button>
                ) : (
                  <div className="grid min-h-64 place-items-center bg-neutral-200">
                    <ImageIcon size={36} />
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => setShareAssetId(asset.id)}
                    className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-950 hover:bg-neutral-50"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                  <a
                    href={asset.downloadUrl}
                    download
                    className="inline-flex items-center gap-2 rounded-md bg-neutral-950 px-3 py-2 text-sm font-semibold text-white"
                  >
                    <Download size={16} />
                    {asset.kind === "video" ? "Download video" : "Download"}
                  </a>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>

      <GalleryFooter />

      {shareAsset ? (
        <AssetShareMenu
          asset={shareAsset}
          eventName={eventName}
          sharePageUrl={sharePageUrl}
          open={Boolean(shareAsset)}
          onClose={() => setShareAssetId(null)}
        />
      ) : null}

      {enlargedAsset?.contentType.startsWith("image/") ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/92 p-4">
          <button
            type="button"
            onClick={() => setEnlargedAssetId(null)}
            className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur hover:bg-white/20"
            aria-label="Close full screen image"
          >
            <X size={24} />
          </button>
          <button
            type="button"
            className="absolute inset-0 cursor-zoom-out"
            onClick={() => setEnlargedAssetId(null)}
            aria-label="Close full screen image"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enlargedAsset.viewUrl}
            alt="Photo booth layout full screen"
            className="relative z-10 max-h-[92vh] max-w-[96vw] object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}

      </div>

      {isNamePromptBlocking ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-name-prompt-title"
        >
          <form
            onSubmit={saveGuestName}
            className="relative w-full max-w-sm rounded-md bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="gallery-name-prompt-title" className="text-2xl font-bold">
              What's your name?
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Add your name so this gallery is easier to identify later.
            </p>
            <label className="mt-5 grid gap-2 text-sm font-semibold text-neutral-700">
              Name
              <input
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                autoFocus
                required
                maxLength={80}
                className="h-12 rounded-md border border-neutral-300 px-4 text-base outline-none focus:border-neutral-950"
              />
            </label>
            {nameError ? <p className="mt-3 rounded-md bg-rose-50 p-3 text-sm text-rose-800">{nameError}</p> : null}
            <Button type="submit" className="mt-5 w-full" disabled={isSavingName || !nameInput.trim()}>
              {isSavingName ? "Saving..." : "Save Name"}
            </Button>
            <button
              type="button"
              onClick={skipGuestName}
              className="mt-3 w-full py-2 text-sm font-medium text-neutral-500 hover:text-neutral-800"
            >
              Skip for now
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
