import { NextResponse } from "next/server";
import { jsonError, handleRouteError } from "@/lib/api";
import { isAuthorizedBoothRequest } from "@/lib/auth/booth";
import { hashSecret } from "@/lib/codes";
import { createServiceClient } from "@/lib/supabase/server";
import { boothValidateSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    if (!isAuthorizedBoothRequest(request)) {
      return jsonError("Unauthorized booth request", 401);
    }

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
      .eq("queue_number", event.current_queue_number)
      .eq("access_code_hash", hashSecret(body.accessCode))
      .eq("payment_status", "paid")
      .in("status", ["waiting", "active"]);

    if (ticketError) {
      throw new Error(ticketError.message);
    }

    const ticket = tickets?.[0];

    if (!ticket) {
      return jsonError("Invalid code or queue position", 403);
    }

    const { data: updatedTicket, error: updateError } = await supabase
      .from("tickets")
      .update({ status: "active" })
      .eq("id", ticket.id)
      .select("*")
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      ticket: updatedTicket,
      galleryUrl: `/gallery/${ticket.gallery_token_lookup}`,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
