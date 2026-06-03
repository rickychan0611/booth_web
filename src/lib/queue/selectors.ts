import type { EventRow, TicketRow } from "@/types/database";
import type { QueueSnapshot } from "@/lib/queue/types";

const ACTIVE_STATUSES = new Set(["waiting", "active"]);

export function getNextWaitingTicket(tickets: Pick<TicketRow, "status" | "queue_number">[]) {
  return tickets
    .filter((ticket) => ticket.status === "waiting")
    .sort((a, b) => a.queue_number - b.queue_number)[0];
}

export function buildQueueSnapshot(event: EventRow, tickets: TicketRow[]): QueueSnapshot {
  const orderedTickets = [...tickets].sort((a, b) => a.queue_number - b.queue_number);
  const nowServing =
    orderedTickets.find(
      (ticket) =>
        ticket.queue_number === event.current_queue_number &&
        ACTIVE_STATUSES.has(ticket.status),
    ) ?? null;

  const nextUp = orderedTickets
    .filter(
      (ticket) =>
        ticket.status === "waiting" && ticket.queue_number > event.current_queue_number,
    )
    .slice(0, 3);

  return {
    event,
    tickets: orderedTickets,
    nowServing,
    nextUp,
  };
}
