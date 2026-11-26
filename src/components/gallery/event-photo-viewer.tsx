"use client";

import { X, ZoomIn, ZoomOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function EventPhotoViewer({ photo, queueNumber, galleryUrl, onClose }: {
  photo: { viewUrl: string; width: number | null; height: number | null };
  queueNumber: number;
  galleryUrl: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, []);

  function toggleZoom() {
    setIsZoomed((current) => !current);
    scrollRef.current?.scrollTo({ top: 0, left: 0 });
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="event-photo-title"
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-neutral-950 p-0 text-white backdrop:bg-black/90"
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-b border-white/15 px-4 py-2">
          <h2 id="event-photo-title" className="mr-auto font-semibold">Photo #{queueNumber}</h2>
          <Link href={galleryUrl} className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">
            View gallery
          </Link>
          <button
            type="button"
            onClick={toggleZoom}
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
            aria-pressed={isZoomed}
            className="grid h-11 w-11 place-items-center rounded-md hover:bg-white/15"
          >
            {isZoomed ? <ZoomOut size={22} /> : <ZoomIn size={22} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo viewer"
            className="grid h-11 w-11 place-items-center rounded-md hover:bg-white/15"
          >
            <X size={24} />
          </button>
        </header>
        <p className="shrink-0 px-4 py-2 text-center text-xs text-neutral-300">
          Scroll to explore the full photo. Pinch or use the zoom button for a closer look.
        </p>
        <div ref={scrollRef} tabIndex={0} role="region" aria-label="Full photo, scroll to explore" className="min-h-0 flex-1 overflow-auto overscroll-contain p-3 sm:p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.viewUrl}
            alt={`Photo booth layout for photo ${queueNumber}`}
            width={photo.width ?? undefined}
            height={photo.height ?? undefined}
            className={isZoomed
              ? "block h-auto w-[200%] max-w-none"
              : "mx-auto block h-auto w-full max-w-full object-contain sm:max-h-[calc(100dvh-10rem)] sm:w-auto"}
          />
        </div>
      </div>
    </dialog>
  );
}
