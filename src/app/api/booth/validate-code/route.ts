import { corsJson, corsOptions, jsonError, handleRouteError } from "@/lib/api";
import { hashSecret } from "@/lib/codes";
import { updateTicketStatus } from "@/lib/queue/service";
import { createServiceClient } from "@/lib/supabase/server";
import { boothValidateSchema } from "@/lib/validation";

export function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  try {
    const body = boothValidateSchema.parse(await request.json());
    const supabase = createServiceClient();
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", body.eventId)
      .single();

    if (eventError) {
      throw new Error(eventError.message);
    }

    if (event.status !== "active") {
      return jsonError("Event is not active", 409);
    }

    const { data: tickets, error: ticketError } = await supabase
      .from("tickets")
      .select("*")
      .eq("event_id", body.eventId)
      .eq("access_code_hash", hashSecret(body.accessCode))
      .eq("payment_status", "paid")
      .in("status", ["waiting", "active", "skipped"])
      .order("queue_number", { ascending: true });

    if (ticketError) {
      throw new Error(ticketError.message);
    }

    const ticket =
      tickets?.find((candidate) => candidate.status === "active") ??
      tickets?.find(
        (candidate) =>
          candidate.status === "skipped" &&
          candidate.queue_number <= event.current_queue_number,
      ) ??
      tickets?.find(
        (candidate) =>
          candidate.status === "waiting" &&
          candidate.queue_number <= event.current_queue_number,
      );

    if (!ticket) {
      return jsonError("This code is not ready yet, or it has already been used.", 403);
    }

    const updatedTicket = await updateTicketStatus({
      eventId: body.eventId,
      ticketId: ticket.id,
      status: "used",
    });

    return corsJson({
      ticket: updatedTicket,
      galleryUrl: `/gallery/${ticket.gallery_token_lookup}`,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
