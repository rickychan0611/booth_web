"use client";

import { Download, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";

type GalleryAsset = {
  id: string;
  kind: string;
  contentType: string;
  viewUrl: string;
  downloadUrl: string;
};

export function GalleryClient({ galleryToken }: { galleryToken: string }) {
  const [eventName, setEventName] = useState("Photo gallery");
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        const response = await fetch(`/api/gallery/${galleryToken}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Gallery not found");
        }

        setEventName(data.event.name);
        setAssets(data.assets);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Gallery not found");
      } finally {
        setIsLoading(false);
      }
    }

    loadGallery();
  }, [galleryToken]);

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl flex-col items-center justify-center">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold">{eventName}</h1>
        </header>

        {isLoading ? <p className="mt-8 text-neutral-600">Loading your gallery...</p> : null}
        {error ? <p className="mt-8 rounded-md bg-rose-50 p-4 text-rose-800">{error}</p> : null}

        {!isLoading && !error && assets.length === 0 ? (
          <section className="mt-8 rounded-md bg-white p-8 text-center shadow-sm">
            <ImageIcon className="mx-auto text-neutral-400" size={42} />
            <h2 className="mt-3 text-xl font-bold">Photos are still processing</h2>
            <p className="mt-2 text-neutral-600">Refresh this page in a moment after the booth finishes uploading.</p>
          </section>
        ) : null}

        <section className="grid w-full max-w-md gap-5">
          {assets.map((asset) => (
            <article key={asset.id} className="overflow-hidden rounded-md bg-white shadow-sm">
              {asset.contentType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <div className="grid aspect-[4/6] w-full place-items-center bg-white">
                  <img src={asset.viewUrl} alt="Photo booth layout" className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="grid aspect-[4/6] place-items-center bg-neutral-200">
                  <ImageIcon size={36} />
                </div>
              )}
              <div className="flex items-center justify-between p-3">
                <a
                  href={asset.downloadUrl}
                  className="ml-auto inline-flex items-center gap-2 rounded-md bg-neutral-950 px-3 py-2 text-sm font-semibold text-white"
                >
                  <Download size={16} />
                  Download
                </a>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
