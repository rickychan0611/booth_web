"use client";

import { ListRestart, Plus, SkipForward, SquareCheckBig, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/queue/status-badge";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { PaymentMethod, TicketRow } from "@/types/database";
import type { QueueSnapshot } from "@/lib/queue/types";

const PAYMENT_METHODS: { value: Exclude<PaymentMethod, "stripe">; label: string }[] = [
  { value: "manual_cash", label: "Cash" },
  { value: "manual_card", label: "Card reader" },
  { value: "manual_etransfer", label: "E-transfer" },
  { value: "manual_other", label: "Other" },
];

type CreatedTicket = {
  queueNumber: number;
  accessCode: string;
  galleryUrl: string;
};

export function StaffQueueClient({ eventId }: { eventId: string }) {
  const [snapshot, setSnapshot] = useState<QueueSnapshot | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<Exclude<PaymentMethod, "stripe">>("manual_cash");
  const [createdTicket, setCreatedTicket] = useState<CreatedTicket | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  const loadSnapshot = useCallback(async () => {
    const response = await fetch(`/api/queue?eventId=${eventId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Unable to load queue");
    }

    setSnapshot(data);
  }, [eventId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadSnapshot().catch((loadError: Error) => setError(loadError.message));
    }, 0);

    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`staff-event-${eventId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events", filter: `id=eq.${eventId}` },
        () => loadSnapshot().catch((loadError: Error) => setError(loadError.message)),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets", filter: `event_id=eq.${eventId}` },
        () => loadSnapshot().catch((loadError: Error) => setError(loadError.message)),
      )
      .subscribe();

    const interval = window.setInterval(
      () => loadSnapshot().catch((loadError: Error) => setError(loadError.message)),
      15000,
    );

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [eventId, loadSnapshot]);

  async function postAction(path: string, body: Record<string, unknown>) {
    setIsBusy(true);
    setError("");

    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Action failed");
      }

      await loadSnapshot();
      return data;
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action failed");
      return null;
    } finally {
      setIsBusy(false);
    }
  }

  async function createTicket() {
    const data = await postAction("/api/tickets/manual", { eventId, paymentMethod });

    if (data?.ticket) {
      setCreatedTicket({
        queueNumber: data.ticket.queue_number,
        accessCode: data.accessCode,
        galleryUrl: data.galleryUrl,
      });
    }
  }

  async function resetQueue() {
    if (!snapshot) {
      return;
    }

    const confirmed = window.confirm("Reset this event queue to #1? This does not delete tickets.");

    if (!confirmed) {
      return;
    }

    await postAction("/api/queue/reset", {
      eventId,
      currentQueueNumber: 1,
      nextQueueNumber: Math.max(1, snapshot.event.next_queue_number),
    });
  }

  function ticketAction(path: string, ticket: TicketRow) {
    return postAction(path, { eventId, ticketId: ticket.id });
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-6 text-neutral-950 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">Staff Control</p>
            <h1 className="text-3xl font-bold">{snapshot?.event.name ?? "Loading event"}</h1>
            <p className="text-sm text-neutral-600">
              Status: {snapshot?.event.status ?? "loading"} · Next ticket #
              {snapshot?.event.next_queue_number ?? "-"}
            </p>
          </div>
          <Button variant="secondary" onClick={resetQueue} disabled={!snapshot || isBusy}>
            <ListRestart size={18} />
            Reset
          </Button>
        </header>

        {error ? <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}

        {createdTicket ? (
          <section className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-900">New paid guest</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-emerald-700">Queue</p>
                <p className="text-3xl font-bold">#{createdTicket.queueNumber}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-emerald-700">Access code</p>
                <p className="text-3xl font-bold">{createdTicket.accessCode}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-emerald-700">Gallery</p>
                <p className="break-all text-sm">{createdTicket.galleryUrl}</p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-md bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Now Serving</p>
            <p className="mt-2 text-7xl font-black">#{snapshot?.event.current_queue_number ?? "-"}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {snapshot?.nextUp.length ? (
                snapshot.nextUp.map((ticket) => (
                  <span key={ticket.id} className="rounded-md bg-neutral-100 px-3 py-2 text-sm font-semibold">
                    Next #{ticket.queue_number}
                  </span>
                ))
              ) : (
                <span className="text-sm text-neutral-500">No waiting guests yet</span>
              )}
            </div>
          </div>

          <div className="rounded-md bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
                Payment method
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value as Exclude<PaymentMethod, "stripe">)}
                  className="h-11 rounded-md border border-neutral-300 bg-white px-3"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </label>
              <Button onClick={createTicket} disabled={isBusy}>
                <Plus size={18} />
                New Paid Guest
              </Button>
            </div>

          </div>
        </section>

        <section className="rounded-md bg-white shadow-sm">
          <div className="border-b border-neutral-200 p-4">
            <h2 className="text-lg font-bold">Active Queue</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {snapshot?.tickets.length ? (
              [...snapshot.tickets].reverse().map((ticket) => (
                <div key={ticket.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-md bg-neutral-100 text-lg font-black">
                      #{ticket.queue_number}
                    </div>
                    <div>
                      <StatusBadge status={ticket.status} />
                      <p className="mt-1 text-sm text-neutral-500">
                        Code {ticket.access_code ?? ticket.access_code_last4} - {ticket.payment_method.replace("manual_", "")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" disabled={isBusy} onClick={() => ticketAction("/api/queue/skip", ticket)}>
                      <SkipForward size={16} />
                      Skip
                    </Button>
                    <Button variant="secondary" disabled={isBusy} onClick={() => ticketAction("/api/queue/used", ticket)}>
                      <SquareCheckBig size={16} />
                      Used
                    </Button>
                    <Button variant="danger" disabled={isBusy} onClick={() => ticketAction("/api/queue/cancel", ticket)}>
                      <X size={16} />
                      Cancel
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-neutral-500">No tickets yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
