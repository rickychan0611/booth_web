"use client";

import { Camera, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { QueueSnapshot } from "@/lib/queue/types";

export function BoothClient({ eventId }: { eventId: string }) {
  const [snapshot, setSnapshot] = useState<QueueSnapshot | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [boothSecret, setBoothSecret] = useState("");
  const [message, setMessage] = useState("");
  const [galleryUrl, setGalleryUrl] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const loadSnapshot = useCallback(async () => {
    const response = await fetch(`/api/queue?eventId=${eventId}`);
    const data = await response.json();
    if (response.ok) {
      setSnapshot(data);
    }
  }, [eventId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadSnapshot();
    }, 0);
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`booth-event-${eventId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events", filter: `id=eq.${eventId}` },
        () => loadSnapshot(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets", filter: `event_id=eq.${eventId}` },
        () => loadSnapshot(),
      )
      .subscribe();

    const interval = window.setInterval(loadSnapshot, 15000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [eventId, loadSnapshot]);

  async function validateCode() {
    setIsBusy(true);
    setMessage("");
    setGalleryUrl("");

    try {
      const response = await fetch("/api/booth/validate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-booth-secret": boothSecret,
        },
        body: JSON.stringify({ eventId, accessCode }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to validate code");
      }

      setTicketId(data.ticket.id);
      setGalleryUrl(data.galleryUrl);
      setMessage("Code accepted. Start the photo session.");
      await loadSnapshot();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to validate code");
    } finally {
      setIsBusy(false);
    }
  }

  async function completeSession() {
    if (!ticketId) {
      return;
    }

    setIsBusy(true);

    try {
      const response = await fetch("/api/booth/complete-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-booth-secret": boothSecret,
        },
        body: JSON.stringify({ eventId, ticketId }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to complete session");
      }

      setMessage("Session complete. Show the gallery QR code.");
      await loadSnapshot();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to complete session");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-8 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="flex items-center gap-3">
          <Camera className="text-rose-400" size={32} />
          <div>
            <p className="text-sm uppercase tracking-wide text-neutral-400">Photo Booth</p>
            <h1 className="text-2xl font-bold">{snapshot?.event.name ?? "Loading event"}</h1>
          </div>
        </header>

        <section className="rounded-md bg-white p-6 text-neutral-950">
          <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Now Serving</p>
          <p className="mt-2 text-8xl font-black">#{snapshot?.event.current_queue_number ?? "-"}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {snapshot?.nextUp.map((ticket) => (
              <span key={ticket.id} className="rounded-md bg-neutral-100 px-3 py-2 text-sm font-semibold">
                Next #{ticket.queue_number}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-3 rounded-md bg-neutral-900 p-5">
          <label className="grid gap-1 text-sm font-semibold">
            Booth secret
            <input
              value={boothSecret}
              onChange={(event) => setBoothSecret(event.target.value)}
              type="password"
              className="h-12 rounded-md border border-neutral-700 bg-neutral-950 px-3 text-white"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Guest access code
            <input
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              inputMode="numeric"
              className="h-14 rounded-md border border-neutral-700 bg-neutral-950 px-3 text-2xl font-bold text-white"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button onClick={validateCode} disabled={isBusy || !accessCode || !boothSecret}>
              {isBusy ? <Loader2 className="animate-spin" size={18} /> : null}
              Validate Code
            </Button>
            <Button variant="secondary" onClick={completeSession} disabled={isBusy || !ticketId || !boothSecret}>
              Complete Session
            </Button>
          </div>
          {message ? <p className="text-sm text-neutral-300">{message}</p> : null}
          {galleryUrl ? (
            <div className="rounded-md bg-white p-4 text-neutral-950">
              <p className="text-sm font-semibold">Gallery QR target</p>
              <p className="break-all text-lg font-bold">{galleryUrl}</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
