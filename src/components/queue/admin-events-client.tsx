"use client";

import Link from "next/link";
import { ImageUp, Link2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { readEventBranding } from "@/lib/events/branding";
import type { EventRow } from "@/types/database";

export function AdminEventsClient() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [uploadingBannerEventId, setUploadingBannerEventId] = useState<string | null>(null);
  const [removingBannerEventId, setRemovingBannerEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingEventNameId, setSavingEventNameId] = useState<string | null>(null);
  const [bannerLinkModalEventId, setBannerLinkModalEventId] = useState<string | null>(null);
  const [bannerLinkInput, setBannerLinkInput] = useState("");
  const [bannerLinkError, setBannerLinkError] = useState("");
  const [savingBannerLinkId, setSavingBannerLinkId] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const bannerEventIdRef = useRef<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const loadEvents = useCallback(async () => {
    const response = await fetch("/api/events");
    const data = await response.json();

    if (response.ok) {
      setEvents(data.events);
    } else {
      setError(data.error ?? "Unable to load events");
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadEvents();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadEvents]);

  function openBannerUpload(eventId: string) {
    bannerEventIdRef.current = eventId;
    bannerInputRef.current?.click();
  }

  async function uploadBanner(file: File) {
    const eventId = bannerEventIdRef.current;
    if (!eventId) return;

    setUploadingBannerEventId(eventId);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/events/${eventId}/gallery-banner`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to upload banner");
      }

      await loadEvents();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload banner");
    } finally {
      setUploadingBannerEventId(null);
      bannerEventIdRef.current = null;
      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }
    }
  }

  function openBannerLinkModal(event: EventRow) {
    setBannerLinkModalEventId(event.id);
    setBannerLinkInput(readEventBranding(event.branding).galleryBannerLinkUrl ?? "");
    setBannerLinkError("");
  }

  function closeBannerLinkModal() {
    setBannerLinkModalEventId(null);
    setBannerLinkInput("");
    setBannerLinkError("");
  }

  async function saveBannerLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bannerLinkModalEventId) return;

    setSavingBannerLinkId(bannerLinkModalEventId);
    setBannerLinkError("");

    try {
      const response = await fetch(`/api/events/${bannerLinkModalEventId}/gallery-banner`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkUrl: bannerLinkInput }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save banner link");
      }

      closeBannerLinkModal();
      await loadEvents();
    } catch (saveError) {
      setBannerLinkError(saveError instanceof Error ? saveError.message : "Unable to save banner link");
    } finally {
      setSavingBannerLinkId(null);
    }
  }

  async function clearBannerLink() {
    if (!bannerLinkModalEventId) return;

    setSavingBannerLinkId(bannerLinkModalEventId);
    setBannerLinkError("");

    try {
      const response = await fetch(`/api/events/${bannerLinkModalEventId}/gallery-banner`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkUrl: "" }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to remove banner link");
      }

      closeBannerLinkModal();
      await loadEvents();
    } catch (removeError) {
      setBannerLinkError(removeError instanceof Error ? removeError.message : "Unable to remove banner link");
    } finally {
      setSavingBannerLinkId(null);
    }
  }

  function startEditingEventName(eventId: string, currentName: string) {
    setEditingEventId(eventId);
    setEditingName(currentName);
    window.setTimeout(() => nameInputRef.current?.focus(), 0);
  }

  function cancelEditingEventName() {
    setEditingEventId(null);
    setEditingName("");
  }

  async function saveEventName(eventId: string, previousName: string) {
    const trimmedName = editingName.trim();

    if (!trimmedName) {
      setError("Event name cannot be empty");
      setEditingName(previousName);
      setEditingEventId(null);
      return;
    }

    if (trimmedName === previousName) {
      cancelEditingEventName();
      return;
    }

    setSavingEventNameId(eventId);
    setError("");

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update event name");
      }

      cancelEditingEventName();
      await loadEvents();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update event name");
      setEditingName(previousName);
    } finally {
      setSavingEventNameId(null);
    }
  }

  async function removeBanner(eventId: string) {
    setRemovingBannerEventId(eventId);
    setError("");

    try {
      const response = await fetch(`/api/events/${eventId}/gallery-banner`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to remove banner");
      }

      await loadEvents();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove banner");
    } finally {
      setRemovingBannerEventId(null);
    }
  }

  async function createEvent() {
    setIsBusy(true);
    setError("");

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to create event");
      }

      setName("");
      setEventDate("");
      await loadEvents();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create event");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-950">
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Admin</p>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="mt-2 text-neutral-600">Create an event, then open the staff or booth view for operations.</p>
        </header>

        {error ? <p className="mt-5 rounded-md bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}

        <section className="mt-6 rounded-md bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">New event</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px_auto] sm:items-end">
            <label className="grid gap-1 text-sm font-medium">
              Event name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 rounded-md border border-neutral-300 px-3"
                placeholder="Wedding Booth Night"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Date
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                className="h-11 rounded-md border border-neutral-300 px-3"
              />
            </label>
            <Button onClick={createEvent} disabled={!name || isBusy}>
              Create
            </Button>
          </div>
        </section>

        <input
          ref={bannerInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void uploadBanner(file);
            }
          }}
        />

        <section className="mt-6 rounded-md bg-white shadow-sm">
          <div className="border-b border-neutral-200 p-4">
            <h2 className="text-lg font-bold">Existing events</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {events.map((event) => {
              const branding = readEventBranding(event.branding);
              const hasBanner = Boolean(branding.galleryBannerR2Key);
              const hasBannerLink = Boolean(branding.galleryBannerLinkUrl);
              const isUploadingBanner = uploadingBannerEventId === event.id;
              const isRemovingBanner = removingBannerEventId === event.id;
              const isEditingName = editingEventId === event.id;
              const isSavingName = savingEventNameId === event.id;

              return (
                <article key={event.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {isEditingName ? (
                      <input
                        ref={nameInputRef}
                        value={editingName}
                        disabled={isSavingName}
                        onChange={(changeEvent) => setEditingName(changeEvent.target.value)}
                        onBlur={() => void saveEventName(event.id, event.name)}
                        onKeyDown={(keyEvent) => {
                          if (keyEvent.key === "Enter") {
                            keyEvent.currentTarget.blur();
                          }
                          if (keyEvent.key === "Escape") {
                            cancelEditingEventName();
                          }
                        }}
                        className="w-full max-w-md rounded-md border border-neutral-300 px-2 py-1 text-base font-bold disabled:opacity-50"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditingEventName(event.id, event.name)}
                        className="text-left text-base font-bold hover:underline"
                      >
                        {event.name}
                      </button>
                    )}
                    <p className="text-sm text-neutral-500">
                      {event.status} · now serving #{event.current_queue_number} · next #{event.next_queue_number}
                      {hasBanner ? (
                        <>
                        <br/>
                          {"Banner set "}
                          <button
                            type="button"
                            onClick={() => void removeBanner(event.id)}
                            disabled={isRemovingBanner}
                            className="text-rose-700 underline underline-offset-2 disabled:opacity-50"
                          >
                            {isRemovingBanner ? "(removing...)" : "(remove)"}
                          </button>
                        </>
                      ) : null}
                      {hasBannerLink ? " · Banner link set" : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openBannerUpload(event.id)}
                      disabled={isUploadingBanner || isRemovingBanner}
                      className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                    >
                      <ImageUp size={16} />
                      {isUploadingBanner ? "Uploading..." : hasBanner ? "Change banner" : "Upload banner"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openBannerLinkModal(event)}
                      className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold"
                    >
                      <Link2 size={16} />
                      {hasBannerLink ? "Banner link" : "Banner link"}
                    </button>
                    <Link
                      className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold"
                      href={`/gallery/event/${event.id}`}
                    >
                      Gallery
                    </Link>
                    <Link className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold" href={`/staff/events/${event.id}`}>
                      Staff
                    </Link>
                    <Link className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold" href={`/booth/events/${event.id}`}>
                      Booth
                    </Link>
                  </div>
                </article>
              );
            })}
            {events.length === 0 ? <p className="p-4 text-sm text-neutral-500">No events yet.</p> : null}
          </div>
        </section>
      </div>

      {bannerLinkModalEventId ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => void saveBannerLink(event)}
            className="w-full max-w-md rounded-md bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Banner link</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Guests can click the gallery banner to open this URL in a new tab.
                </p>
              </div>
              <button
                type="button"
                onClick={closeBannerLinkModal}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <label className="mt-5 grid gap-2 text-sm font-semibold text-neutral-700">
              URL
              <input
                value={bannerLinkInput}
                onChange={(event) => setBannerLinkInput(event.target.value)}
                autoFocus
                type="url"
                placeholder="https://example.com"
                className="h-11 rounded-md border border-neutral-300 px-3 text-base outline-none focus:border-neutral-950"
              />
            </label>
            {bannerLinkError ? (
              <p className="mt-3 rounded-md bg-rose-50 p-3 text-sm text-rose-800">{bannerLinkError}</p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button type="submit" disabled={Boolean(savingBannerLinkId)}>
                {savingBannerLinkId ? "Saving..." : "Save link"}
              </Button>
              {bannerLinkInput.trim() ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={Boolean(savingBannerLinkId)}
                  onClick={() => void clearBannerLink()}
                >
                  Remove link
                </Button>
              ) : null}
              <Button type="button" variant="secondary" onClick={closeBannerLinkModal}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
