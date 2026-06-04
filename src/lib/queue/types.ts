import type { EventRow, TicketRow } from "@/types/database";

export type QueueSnapshot = {
  event: EventRow;
  tickets: TicketRow[];
  nowServing: TicketRow | null;
  nextUp: TicketRow[];
  missedButAccepted: TicketRow[];
};
