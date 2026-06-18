import { describe, expect, it } from "vitest";
import { buildQueueSnapshot, getNextWaitingTicket } from "@/lib/queue/selectors";
import type { EventRow, TicketRow } from "@/types/database";

const event: EventRow = {
  id: "event-1",
  name: "Test Event",
  slug: "test-event",
  event_date: null,
  status: "active",
  current_queue_number: 2,
  next_queue_number: 6,
  branding: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

function ticket(queueNumber: number, status: TicketRow["status"]): TicketRow {
  return {
    id: `ticket-${queueNumber}`,
    event_id: event.id,
    queue_number: queueNumber,
    access_code: "1234",
    access_code_hash: "hash",
    access_code_last4: "1234",
    name: null,
    gallery_token_hash: "hash",
    gallery_token_lookup: "token",
    status,
    payment_status: "paid",
    payment_method: "manual_cash",
    stripe_checkout_session_id: null,
    phone_number: null,
    used_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}

describe("queue selectors", () => {
  it("selects the lowest waiting ticket as the next valid queue target", () => {
    expect(
      getNextWaitingTicket([
        ticket(1, "used"),
        ticket(2, "skipped"),
        ticket(4, "waiting"),
        ticket(3, "cancelled"),
      ]),
    ).toMatchObject({ queue_number: 4 });
  });

  it("builds now serving, next up, and missed-but-accepted tickets", () => {
    const snapshot = buildQueueSnapshot(event, [
      ticket(1, "used"),
      ticket(2, "active"),
      ticket(3, "cancelled"),
      ticket(4, "waiting"),
      ticket(5, "waiting"),
      ticket(6, "skipped"),
    ]);

    expect(snapshot.nowServing?.queue_number).toBe(2);
    expect(snapshot.nextUp.map((nextTicket) => nextTicket.queue_number)).toEqual([4, 5]);
    expect(snapshot.missedButAccepted).toEqual([]);
  });

  it("keeps earlier skipped tickets visible because their codes still work", () => {
    const snapshot = buildQueueSnapshot(
      { ...event, current_queue_number: 5 },
      [ticket(2, "skipped"), ticket(4, "skipped"), ticket(5, "waiting")],
    );

    expect(snapshot.missedButAccepted.map((missedTicket) => missedTicket.queue_number)).toEqual([
      2, 4,
    ]);
  });

  it("keeps a skipped current ticket usable when there is no later waiting ticket", () => {
    const snapshot = buildQueueSnapshot(
      { ...event, current_queue_number: 5 },
      [ticket(5, "skipped")],
    );

    expect(snapshot.missedButAccepted.map((missedTicket) => missedTicket.queue_number)).toEqual([5]);
  });
});
