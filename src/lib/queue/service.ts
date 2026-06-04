import { createServiceClient } from "@/lib/supabase/server";
import { buildQueueSnapshot } from "@/lib/queue/selectors";
import type { PaymentMethod, TicketStatus } from "@/types/database";

export async function getQueueSnapshot(eventId: string) {
  const supabase = createServiceClient();
  const [eventResult, ticketResult] = await Promise.all([
    supabase.from("events").select("*").eq("id", eventId).single(),
    supabase.from("tickets").select("*").eq("event_id", eventId).order("queue_number"),
  ]);

  if (eventResult.error) {
    throw new Error(eventResult.error.message);
  }

  if (ticketResult.error) {
    throw new Error(ticketResult.error.message);
  }

  return buildQueueSnapshot(eventResult.data, ticketResult.data ?? []);
}

export async function createManualTicket(input: {
  eventId: string;
  accessCode: string;
  accessCodeHash: string;
  accessCodeLast4: string;
  galleryTokenHash: string;
  galleryTokenLookup: string;
  paymentMethod: PaymentMethod;
}) {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("create_manual_ticket", {
    p_event_id: input.eventId,
    p_access_code: input.accessCode,
    p_access_code_hash: input.accessCodeHash,
    p_access_code_last4: input.accessCodeLast4,
    p_gallery_token_hash: input.galleryTokenHash,
    p_gallery_token_lookup: input.galleryTokenLookup,
    p_payment_method: input.paymentMethod,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function advanceQueue(eventId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("advance_event_queue", {
    p_event_id: eventId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateTicketStatus(input: {
  eventId: string;
  ticketId: string;
  status: TicketStatus;
}) {
  const supabase = createServiceClient();
  const { data: existingTicket, error: existingError } = await supabase
    .from("tickets")
    .select("status")
    .eq("id", input.ticketId)
    .eq("event_id", input.eventId)
    .single();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const { data, error } = await supabase
    .from("tickets")
    .update({
      status: input.status,
      used_at: input.status === "used" ? new Date().toISOString() : null,
    })
    .eq("id", input.ticketId)
    .eq("event_id", input.eventId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (
    existingTicket.status !== input.status &&
    (input.status === "skipped" || input.status === "cancelled" || input.status === "used")
  ) {
    await advanceQueue(input.eventId);
  }

  return data;
}
