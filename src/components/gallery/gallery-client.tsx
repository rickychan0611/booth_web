"use client";

import { ArrowLeft, Download, ImageIcon, Share2, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GalleryFooter, GalleryHeader } from "@/components/gallery/gallery-chrome";
import { loadShareFile, tryNativeShareAsset, type GalleryAsset } from "@/components/gallery/gallery-share";

function isVideoAsset(asset: GalleryAsset) {
  return asset.kind === "video" || asset.contentType.startsWith("video/");
}

export function GalleryClient({
  galleryToken,
  sharePageUrl,
}: {
  galleryToken: string;
  sharePageUrl: string;
}) {
  const [eventName, setEventName] = useState("Photo gallery");
  const [eventId, setEventId] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerLinkUrl, setBannerLinkUrl] = useState<string | null>(null);
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sharingAssetId, setSharingAssetId] = useState<string | null>(null);
  const [shareFilesById, setShareFilesById] = useState<Record<string, File>>({});
  const [shareError, setShareError] = useState("");
  const [enlargedAssetId, setEnlargedAssetId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);

  const enlargedAsset = assets.find((asset) => asset.id === enlargedAssetId) ?? null;

  useEffect(() => {
    async function loadAdminSession() {
      const response = await fetch("/api/admin/auth");
      if (!response.ok) return;
      const data = await response.json();
      setIsAdmin(Boolean(data.isAdmin));
    }

    void loadAdminSession();
  }, []);

  useEffect(() => {
    async function loadGallery() {
      try {
        const response = await fetch(`/api/gallery/${galleryToken}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Gallery not found");
        }

        setEventName(data.event.name);
        setEventId(data.event.id);
        setBannerUrl(data.event.bannerUrl ?? null);
        setBannerLinkUrl(data.event.bannerLinkUrl ?? null);
        setAssets(data.assets);
        setQueueNumber(data.ticket?.queueNumber ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Gallery not found");
      } finally {
        setIsLoading(false);
      }
    }

    loadGallery();
  }, [galleryToken]);

  useEffect(() => {
    if (!assets.length) return;

    let cancelled = false;

    async function preloadShareFiles() {
      const entries = await Promise.all(
        assets.map(async (asset) => {
          const file = await loadShareFile(galleryToken, asset);
          return file ? ([asset.id, file] as const) : null;
        }),
      );

      if (cancelled) {
        return;
      }

      const next: Record<string, File> = {};
      for (const entry of entries) {
        if (entry) {
          next[entry[0]] = entry[1];
        }
      }
      setShareFilesById(next);
    }

    void preloadShareFiles();

    return () => {
      cancelled = true;
    };
  }, [assets, galleryToken]);

  async function handleShareClick(asset: GalleryAsset) {
    setSharingAssetId(asset.id);
    setShareError("");

    const outcome = await tryNativeShareAsset({
      asset,
      eventName,
      sharePageUrl,
      shareFile: shareFilesById[asset.id] ?? null,
    });

    setSharingAssetId(null);

    if (outcome === "unsupported") {
      setShareError("Sharing is not supported here. Open this gallery in Safari or Chrome on your phone.");
    }
  }

  async function deleteAsset(asset: GalleryAsset) {
    if (!window.confirm("Permanently delete this file from the gallery and cloud storage?")) return;

    setDeletingAssetId(asset.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/assets/${asset.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not delete file");

      setAssets((current) => current.filter((item) => item.id !== asset.id));
      setShareFilesById((current) => {
        const next = { ...current };
        delete next[asset.id];
        return next;
      });
      setEnlargedAssetId((current) => current === asset.id ? null : current);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete file");
    } finally {
      setDeletingAssetId(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 text-neutral-950">
      <GalleryHeader />

      {eventId ? (
        <div className="px-4 pt-4">
          <div className="mx-auto w-full max-w-4xl">
            <Link
              href={`/gallery/event/${eventId}`}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-950 shadow-sm hover:bg-neutral-50"
            >
              <ArrowLeft size={16} />
              Back to Event gallery
            </Link>
          </div>
        </div>
      ) : null}

      {bannerUrl ? (
        <div className="bg-neutral-100 sm:px-4 sm:pt-4">
          <div className="w-full sm:mx-auto sm:max-w-[600px] sm:overflow-hidden sm:rounded-md sm:bg-white sm:shadow-sm">
            {bannerLinkUrl ? (
              <a
                href={bannerLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full w-full"
                aria-label="Open event banner link"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bannerUrl}
                  alt={`${eventName} banner`}
                  className="block h-auto w-full cursor-pointer transition-opacity hover:opacity-95"
                />
              </a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bannerUrl}
                alt={`${eventName} banner`}
                className="block h-auto w-full"
              />
            )}
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

          <section className="grid w-full max-w-3xl gap-8">
            {shareError ? (
              <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">{shareError}</p>
            ) : null}
            {assets.map((asset) => (
              <article
                key={asset.id}
                className={`relative overflow-hidden rounded-lg bg-white shadow-sm ${isVideoAsset(asset) ? "mx-auto w-full max-w-[460px]" : "w-full"}`}
              >
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <p className="mr-auto flex items-center gap-2 text-xs font-medium text-neutral-500">
                    {isVideoAsset(asset)
                      ? "Video"
                      : queueNumber !== null
                        ? `#${queueNumber}`
                        : ""}
                  </p>
                  {isAdmin ? (
                    <button
                      type="button"
                      disabled={deletingAssetId === asset.id}
                      onClick={() => void deleteAsset(asset)}
                      className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                      {deletingAssetId === asset.id ? "Deleting..." : "Delete"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={sharingAssetId === asset.id}
                    onClick={() => void handleShareClick(asset)}
                    className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-950 hover:bg-neutral-50 disabled:opacity-60"
                  >
                    <Share2 size={16} />
                    {sharingAssetId === asset.id ? "Preparing..." : "Share"}
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
                {isVideoAsset(asset) ? (
                  <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
                    <video
                      className="gallery-portrait-video absolute inset-0 h-full w-full object-cover"
                      controls
                      playsInline
                      loop
                      preload="metadata"
                      src={asset.viewUrl}
                    >
                      <track kind="captions" />
                    </video>
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
              </article>
            ))}
          </section>
        </div>
      </main>

      <GalleryFooter />

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
  );
}
