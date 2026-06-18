"use client";

import { Download, Film, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type GalleryAsset = {
  id: string;
  kind: string;
  contentType: string;
  viewUrl: string;
};

type GallerySession = {
  ticketId: string;
  queueNumber: number;
  name: string | null;
  phoneNumber: string | null;
  galleryUrl: string;
  usedAt: string | null;
  createdAt: string;
  assets: GalleryAsset[];
};

function sessionThumbnail(session: GallerySession) {
  return (
    session.assets.find((asset) => asset.kind === "thumbnail" && asset.contentType.startsWith("image/")) ??
    session.assets.find((asset) => asset.kind === "layout" && asset.contentType.startsWith("image/")) ??
    session.assets.find((asset) => asset.contentType.startsWith("image/")) ??
    null
  );
}

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function csvCell(value: string | number | null | undefined) {
  const stringValue = value === null || value === undefined ? "" : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function eventFileName(eventName: string) {
  return `${eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "event"}-gallery.csv`;
}

export function EventGalleryClient({ eventId }: { eventId: string }) {
  const [eventName, setEventName] = useState("Event gallery");
  const [sessions, setSessions] = useState<GallerySession[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEventGallery() {
      try {
        const response = await fetch(`/api/gallery/event/${eventId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Event gallery not found");
        }

        setEventName(data.event.name);
        setSessions(data.sessions);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Event gallery not found");
      } finally {
        setIsLoading(false);
      }
    }

    loadEventGallery();
  }, [eventId]);

  const totalAssets = sessions.reduce((count, session) => count + session.assets.length, 0);
  const csvData = useMemo(() => {
    const rows = [
      ["Event", "Photo Number", "Name", "Phone Number", "Gallery URL", "File Count", "Used At", "Created At"],
      ...sessions.map((session) => [
        eventName,
        session.queueNumber,
        session.name ?? "",
        session.phoneNumber ?? "",
        session.galleryUrl,
        session.assets.length,
        session.usedAt ?? "",
        session.createdAt,
      ]),
    ];
    return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  }, [eventName, sessions]);

  function exportCsv() {
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = eventFileName(eventName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-950">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 grid gap-4 text-center sm:grid-cols-[1fr_auto] sm:items-end sm:text-left">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Event gallery</p>
            <h1 className="mt-1 text-3xl font-bold">{eventName}</h1>
            {!isLoading && !error ? (
              <p className="mt-2 text-neutral-600">
                {sessions.length} session{sessions.length === 1 ? "" : "s"} - {totalAssets} file
                {totalAssets === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>
          <Button type="button" variant="secondary" onClick={exportCsv} disabled={isLoading || sessions.length === 0}>
            <Download size={16} />
            Export CSV
          </Button>
        </header>

        {isLoading ? <p className="text-center text-neutral-600">Loading event gallery...</p> : null}
        {error ? <p className="rounded-md bg-rose-50 p-4 text-rose-800">{error}</p> : null}

        {!isLoading && !error && sessions.length === 0 ? (
          <section className="rounded-md bg-white p-8 text-center shadow-sm">
            <ImageIcon className="mx-auto text-neutral-400" size={42} />
            <h2 className="mt-3 text-xl font-bold">No photos yet</h2>
            <p className="mt-2 text-neutral-600">
              Guest galleries will appear here after the booth uploads photos for this event.
            </p>
          </section>
        ) : null}

        <section className="grid gap-3">
          {sessions.map((session) => {
            const thumbnail = sessionThumbnail(session);
            const videoAsset = session.assets.find((asset) => asset.contentType.startsWith("video/"));
            const sessionDate = formatDate(session.usedAt ?? session.createdAt);

            return (
              <article key={session.ticketId} className="grid grid-cols-[96px_1fr] gap-4 rounded-md bg-white p-3 shadow-sm sm:grid-cols-[128px_1fr]">
                <Link href={session.galleryUrl} className="relative grid aspect-square place-items-center overflow-hidden rounded-md bg-neutral-100">
                  {thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbnail.viewUrl} alt={`Photo ${session.queueNumber}`} className="h-full w-full object-cover" />
                  ) : videoAsset ? (
                    <>
                      <video className="h-full w-full object-cover" muted playsInline preload="metadata" src={videoAsset.viewUrl}>
                        <track kind="captions" />
                      </video>
                      <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                        <Film size={12} />
                        Video
                      </span>
                    </>
                  ) : (
                    <ImageIcon size={28} className="text-neutral-400" />
                  )}
                </Link>

                <div className="grid min-w-0 content-center gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold">{session.name || "No name yet"}</p>
                    <p className="truncate text-sm text-neutral-600">{session.phoneNumber || "No phone number"}</p>
                    <p className="text-sm text-neutral-500">
                      Photo #{session.queueNumber}{sessionDate ? ` - ${sessionDate}` : ""}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {session.assets.length} file{session.assets.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Link
                    href={session.galleryUrl}
                    className="inline-flex h-10 w-fit items-center justify-center rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white"
                  >
                    Open Gallery
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

