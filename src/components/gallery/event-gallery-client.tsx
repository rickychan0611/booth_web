"use client";

import { Download, Film, ImageIcon, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

type GalleryPreview = {
  id: string;
  kind: string;
  contentType: string;
  viewUrl: string;
  downloadUrl: string;
};

type GallerySession = {
  ticketId: string;
  queueNumber: number;
  name: string | null;
  phoneNumber: string | null;
  galleryUrl: string;
  usedAt: string | null;
  createdAt: string;
  assetCount: number;
  preview: GalleryPreview | null;
};

type Pagination = {
  page: number;
  pageSize: number;
  totalSessions: number;
  totalPages: number;
  totalAssets: number;
  search?: string;
};

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

function isVideoPreview(preview: GalleryPreview | null) {
  return Boolean(preview && (preview.kind === "video" || preview.contentType.startsWith("video/")));
}

function sessionImageFilename(queueNumber: number, contentType: string) {
  if (contentType.includes("png")) return `photo-${queueNumber}.png`;
  if (contentType.includes("webp")) return `photo-${queueNumber}.webp`;
  return `photo-${queueNumber}.jpg`;
}

export function EventGalleryClient({ eventId }: { eventId: string }) {
  const [eventName, setEventName] = useState("Event gallery");
  const [sessions, setSessions] = useState<GallerySession[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const loadEventGallery = useCallback(async (requestedPage: number, searchQuery: string) => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(requestedPage),
        limit: String(PAGE_SIZE),
      });
      if (searchQuery) {
        params.set("search", searchQuery);
      }

      const response = await fetch(`/api/gallery/event/${eventId}?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Event gallery not found");
      }

      setEventName(data.event.name);
      setSessions(data.sessions);
      setPagination(data.pagination);
      setPage(data.pagination.page);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Event gallery not found");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
  }, [eventId]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    void loadEventGallery(page, debouncedSearch);
  }, [eventId, page, debouncedSearch, loadEventGallery]);

  const totalAssets = pagination?.totalAssets ?? 0;
  const totalSessions = pagination?.totalSessions ?? 0;
  const isSearching = debouncedSearch.length > 0;

  async function exportCsv() {
    setIsExporting(true);

    try {
      const response = await fetch(`/api/gallery/event/${eventId}?metadataOnly=1`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not export gallery list");
      }

      const rows = [
        ["Event", "Photo Number", "Name", "Phone Number", "Gallery URL", "File Count", "Used At", "Created At"],
        ...(data.sessions as GallerySession[]).map((session) => [
          data.event.name,
          session.queueNumber,
          session.name ?? "",
          session.phoneNumber ?? "",
          session.galleryUrl,
          session.assetCount,
          session.usedAt ?? "",
          session.createdAt,
        ]),
      ];
      const csvData = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = eventFileName(data.event.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Could not export gallery list");
    } finally {
      setIsExporting(false);
    }
  }

  const pageLabel = useMemo(() => {
    if (!pagination || pagination.totalSessions === 0) return "";
    const start = (pagination.page - 1) * pagination.pageSize + 1;
    const end = Math.min(pagination.page * pagination.pageSize, pagination.totalSessions);
    return `Showing ${start}-${end} of ${pagination.totalSessions}`;
  }, [pagination]);

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-950">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 grid gap-4 text-center sm:grid-cols-[1fr_auto] sm:items-end sm:text-left">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Event gallery</p>
            <h1 className="mt-1 text-3xl font-bold">{eventName}</h1>
            {!isLoading && !error ? (
              <p className="mt-2 text-neutral-600">
                {totalSessions} session{totalSessions === 1 ? "" : "s"} · {totalAssets} file
                {totalAssets === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void exportCsv()}
            disabled={isLoading || isExporting || totalSessions === 0}
          >
            <Download size={16} />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </header>

        <label className="mb-6 block">
          <span className="sr-only">Search by photo number or phone number</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by photo # or phone number"
              className="h-11 w-full rounded-md border border-neutral-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-neutral-950"
            />
          </div>
        </label>

        {isLoading ? <p className="text-center text-neutral-600">Loading event gallery...</p> : null}
        {error ? <p className="rounded-md bg-rose-50 p-4 text-rose-800">{error}</p> : null}

        {!isLoading && !error && sessions.length === 0 ? (
          <section className="rounded-md bg-white p-8 text-center shadow-sm">
            <ImageIcon className="mx-auto text-neutral-400" size={42} />
            <h2 className="mt-3 text-xl font-bold">{isSearching ? "No matching galleries" : "No photos yet"}</h2>
            <p className="mt-2 text-neutral-600">
              {isSearching
                ? "Try a different photo number or phone number."
                : "Guest galleries will appear here after the booth uploads photos for this event."}
            </p>
          </section>
        ) : null}

        <section className="grid gap-3">
          {sessions.map((session) => {
            const preview = session.preview;
            const sessionDate = formatDate(session.usedAt ?? session.createdAt);

            return (
              <article key={session.ticketId} className="grid grid-cols-[96px_1fr] gap-4 rounded-md bg-white p-3 shadow-sm sm:grid-cols-[128px_1fr]">
                <Link href={session.galleryUrl} className="relative grid aspect-square place-items-center overflow-hidden rounded-md bg-neutral-100">
                  {preview && !isVideoPreview(preview) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview.viewUrl} alt={`Photo ${session.queueNumber}`} className="h-full w-full object-cover" />
                  ) : preview && isVideoPreview(preview) ? (
                    <>
                      <video className="h-full w-full object-cover" muted playsInline preload="metadata" src={preview.viewUrl}>
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
                      Photo #{session.queueNumber}{sessionDate ? ` · ${sessionDate}` : ""}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {session.assetCount} file{session.assetCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {preview && !isVideoPreview(preview) ? (
                      <a
                        href={preview.downloadUrl}
                        download={sessionImageFilename(session.queueNumber, preview.contentType)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-950 hover:bg-neutral-50"
                      >
                        <Download size={16} />
                        Download
                      </a>
                    ) : null}
                    <Link
                      href={session.galleryUrl}
                      className="inline-flex h-10 items-center justify-center rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white"
                    >
                      Open Gallery
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {!isLoading && !error && pagination && pagination.totalPages > 1 ? (
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-neutral-600">{pageLabel}</p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <span className="px-2 text-sm font-medium text-neutral-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={pagination.page >= pagination.totalPages || isLoading}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
