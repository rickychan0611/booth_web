"use client";

import { Download, ImageIcon, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EventPhotoViewer } from "@/components/gallery/event-photo-viewer";

const PAGE_SIZE = 20;

type GalleryPreview = {
  contentType: string;
  viewUrl: string;
  width: number | null;
  height: number | null;
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
};

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
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<GallerySession | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  const loadEventGallery = useCallback(async (requestedPage: number, searchQuery: string) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(requestedPage),
        limit: String(PAGE_SIZE),
      });
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/gallery/event/${eventId}?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "Event gallery not found");
      if (requestId !== requestIdRef.current) return;

      setEventName(data.event.name);
      setSessions((current) => {
        const merged = requestedPage === 1 ? data.sessions : [...current, ...data.sessions];
        return Array.from(
          new Map(
            (merged as GallerySession[]).map((session) => [session.ticketId, session]),
          ).values(),
        );
      });
      setPagination(data.pagination);
      setPage(data.pagination.page);
    } catch (loadError) {
      if (requestId !== requestIdRef.current) return;
      setError(loadError instanceof Error ? loadError.message : "Event gallery not found");
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [eventId]);

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
    const timeout = window.setTimeout(() => {
      const nextSearch = search.trim();
      if (nextSearch === debouncedSearch) return;

      setDebouncedSearch(nextSearch);
      setPage(1);
      setSessions([]);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [search, debouncedSearch]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadEventGallery(page, debouncedSearch);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [page, debouncedSearch, loadEventGallery]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || isLoading || !pagination || page >= pagination.totalPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPage((current) => Math.min(current + 1, pagination.totalPages));
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isLoading, page, pagination]);

  const totalAssets = pagination?.totalAssets ?? 0;
  const totalSessions = pagination?.totalSessions ?? 0;
  const isSearching = debouncedSearch.length > 0;
  const photos = sessions.filter(
    (session): session is GallerySession & { preview: GalleryPreview } =>
      session.preview?.contentType.startsWith("image/") === true &&
      Boolean(session.preview.viewUrl),
  );

  async function exportCsv() {
    setIsExporting(true);

    try {
      const response = await fetch(`/api/gallery/event/${eventId}?metadataOnly=1`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not export gallery list");

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

  async function deleteSession(session: GallerySession) {
    if (!window.confirm(`Permanently delete all ${session.assetCount} files in photo #${session.queueNumber}?`)) {
      return;
    }

    setDeletingTicketId(session.ticketId);
    setError("");
    try {
      const response = await fetch(`/api/admin/sessions/${session.ticketId}/assets`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not delete gallery files");

      setSessions((current) => current.filter((item) => item.ticketId !== session.ticketId));
      setPagination((current) => current ? {
        ...current,
        totalSessions: Math.max(0, current.totalSessions - 1),
        totalAssets: Math.max(0, current.totalAssets - data.deletedFileCount),
      } : current);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete gallery files");
    } finally {
      setDeletingTicketId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f2ef] px-4 py-8 text-neutral-950 sm:px-8">
      <div className="mx-auto w-full max-w-[1500px]">
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
          <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void exportCsv()}
              disabled={isLoading || isExporting || totalSessions === 0}
            >
              <Download size={16} />
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </header>

        <label className="mb-10 block">
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

        {isLoading && sessions.length === 0 ? (
          <p className="text-center text-neutral-600">Loading event gallery...</p>
        ) : null}
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

        <section aria-label="Event photos" className="columns-1 gap-5 sm:columns-2 lg:columns-3 lg:gap-6">
          {photos.map((session, index) => (
            <article
              key={session.ticketId}
              className="event-gallery-tile mb-5 break-inside-avoid overflow-hidden rounded-lg bg-white shadow-sm lg:mb-6"
              style={{ animationDelay: `${Math.min(index, 18) * 45}ms` }}
            >
              <button
                type="button"
                onClick={() => setSelectedPhoto(session)}
                aria-label={`Enlarge photo ${session.queueNumber}`}
                className="flex w-full cursor-zoom-in justify-center bg-neutral-200/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-neutral-950"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={session.preview.viewUrl}
                  alt=""
                  width={session.preview.width ?? 1200}
                  height={session.preview.height ?? 800}
                  loading={index < 9 ? "eager" : "lazy"}
                  decoding="async"
                  className="block h-auto max-h-[65svh] w-auto max-w-full object-contain sm:max-h-[480px]"
                />
              </button>
              <div className="flex min-h-14 flex-wrap items-center gap-3 px-3 py-2">
                <span className="mr-auto text-sm font-semibold text-neutral-600">Photo #{session.queueNumber}</span>
                <Link
                  href={session.galleryUrl}
                  className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
                >
                  View gallery
                </Link>
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => void deleteSession(session)}
                    disabled={deletingTicketId === session.ticketId}
                    aria-label={`Delete all files in photo ${session.queueNumber}`}
                    className="grid h-11 w-11 place-items-center rounded-md bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                  >
                    <Trash2 size={18} />
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        <div ref={loadMoreRef} className="grid h-24 place-items-center" aria-live="polite">
          {isLoading && sessions.length > 0 ? (
            <span
              aria-label="Loading more photos"
              className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800"
            />
          ) : null}
        </div>
      </div>
      {selectedPhoto?.preview ? (
        <EventPhotoViewer
          photo={selectedPhoto.preview}
          queueNumber={selectedPhoto.queueNumber}
          galleryUrl={selectedPhoto.galleryUrl}
          onClose={() => setSelectedPhoto(null)}
        />
      ) : null}
    </main>
  );
}
