"use client";

import { Search } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { GalleryFooter, GalleryHeader } from "@/components/gallery/gallery-chrome";
import { Button } from "@/components/ui/button";

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 15);
}

type GalleryAsset = {
  id: string;
  kind: string;
  contentType: string;
  viewUrl: string;
};

type GallerySession = {
  ticketId: string;
  eventId: string;
  eventName: string;
  eventDate: string | null;
  queueNumber: number;
  name: string | null;
  galleryUrl: string;
  usedAt: string | null;
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

export function FindImageClient() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [sessions, setSessions] = useState<GallerySession[]>([]);
  const resultsRef = useRef<HTMLElement | null>(null);

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length < 7) {
      setMessage("Please enter a valid phone number.");
      return;
    }

    try {
      setIsSearching(true);
      setMessage("");
      setSessions([]);
      const response = await fetch(`/api/gallery/by-phone?phone=${encodeURIComponent(normalizedPhone)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not search for your image.");
      }

      const nextSessions = Array.isArray(data.sessions) ? data.sessions : [];
      if (nextSessions.length === 0) {
        setMessage("We could not find a gallery for that phone number yet.");
        return;
      }
      setSessions(nextSessions);
      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not search for your image.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 text-neutral-950">
      <GalleryHeader />
      <main className="flex flex-1 px-4 py-12">
        <div className="mx-auto grid w-full max-w-3xl content-start gap-6">
          <section className="mx-auto w-full max-w-md rounded-md bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-700">
              <Search size={24} />
            </div>
            <h1 className="mt-4 text-3xl font-bold">Find Your Image</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Enter the phone number you used at the booth and we will show every matching gallery.
            </p>

            <form onSubmit={submitSearch} className="mt-6 grid gap-4">
              <label className="grid gap-2 text-left text-sm font-semibold text-neutral-700">
                Phone number
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="604 123 4567"
                  className="h-12 rounded-md border border-neutral-300 px-4 text-lg font-medium outline-none focus:border-neutral-950"
                />
              </label>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? "Searching..." : "Find My Image"}
              </Button>
            </form>

            {message ? <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-900">{message}</p> : null}
          </section>

          {sessions.length > 0 ? (
            <section ref={resultsRef} className="grid scroll-mt-20 gap-3">
              <div className="text-center">
                <h2 className="text-2xl font-bold">We found {sessions.length} matching {sessions.length === 1 ? "gallery" : "galleries"}</h2>
                <p className="mt-1 text-sm text-neutral-600">Choose the gallery you want to open.</p>
              </div>
              <div className="grid gap-3">
                {sessions.map((session) => {
                  const thumbnail = sessionThumbnail(session);
                  const sessionDate = formatDate(session.usedAt ?? session.eventDate);
                  return (
                    <article key={session.ticketId} className="grid grid-cols-[96px_1fr] gap-4 rounded-md bg-white p-3 shadow-sm sm:grid-cols-[128px_1fr]">
                      <a href={session.galleryUrl} className="grid aspect-square place-items-center overflow-hidden rounded-md bg-neutral-100">
                        {thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumbnail.viewUrl} alt="Gallery thumbnail" className="h-full w-full object-cover" />
                        ) : (
                          <Search className="text-neutral-400" size={28} />
                        )}
                      </a>
                      <div className="grid min-w-0 content-center gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-lg font-bold">{session.name || "No name yet"}</p>
                          <p className="truncate text-sm text-neutral-600">{session.eventName}</p>
                          <p className="text-sm text-neutral-500">Photo #{session.queueNumber}{sessionDate ? ` - ${sessionDate}` : ""}</p>
                        </div>
                        <a href={session.galleryUrl} className="inline-flex h-10 w-fit items-center justify-center rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white">
                          Open Gallery
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <GalleryFooter />
    </div>
  );
}
