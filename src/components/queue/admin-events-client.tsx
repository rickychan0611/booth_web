"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { EventRow } from "@/types/database";

export function AdminEventsClient() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

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

        <section className="mt-6 rounded-md bg-white shadow-sm">
          <div className="border-b border-neutral-200 p-4">
            <h2 className="text-lg font-bold">Existing events</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {events.map((event) => (
              <article key={event.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold">{event.name}</h3>
                  <p className="text-sm text-neutral-500">
                    {event.status} · now serving #{event.current_queue_number} · next #{event.next_queue_number}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold" href={`/staff/events/${event.id}`}>
                    Staff
                  </Link>
                  <Link className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold" href={`/booth/events/${event.id}`}>
                    Booth
                  </Link>
                </div>
              </article>
            ))}
            {events.length === 0 ? <p className="p-4 text-sm text-neutral-500">No events yet.</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
