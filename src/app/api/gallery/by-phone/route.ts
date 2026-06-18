import { NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api";
import { serializeGalleryAssets } from "@/lib/gallery/assets";
import { normalizePhoneNumber } from "@/lib/phone";
import { createServiceClient } from "@/lib/supabase/server";
import { galleryByPhoneSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const eventId = url.searchParams.get("eventId") || undefined;
    const body = galleryByPhoneSchema.parse({
      eventId,
      phone: url.searchParams.get("phone") ?? "",
    });
    const phoneNumber = normalizePhoneNumber(body.phone);
    if (phoneNumber.length < 7) {
      return jsonError("Enter a valid phone number", 400);
    }

    const supabase = createServiceClient();
    if (body.eventId) {
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id, name")
        .eq("id", body.eventId)
        .single();
      if (eventError || !event) {
        return jsonError("Event not found", 404);
      }
    }

    let ticketQuery = supabase
      .from("tickets")
      .select("id, event_id, queue_number, gallery_token_lookup, used_at, created_at, name")
      .eq("phone_number", phoneNumber)
      .order("used_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (body.eventId) {
      ticketQuery = ticketQuery.eq("event_id", body.eventId);
    }
    const ticketResult = await ticketQuery;
    if (ticketResult.error) {
      throw new Error(ticketResult.error.message);
    }

    const tickets = ticketResult.data ?? [];
    if (tickets.length === 0) {
      return NextResponse.json({
        phoneNumber,
        sessions: [],
      });
    }

    const ticketIds = tickets.map((ticket) => ticket.id);
    const eventIds = [...new Set(tickets.map((ticket) => ticket.event_id))];
    const [assetResult, eventResult] = await Promise.all([
      supabase
        .from("photo_assets")
        .select("id, ticket_id, kind, content_type, r2_key, width, height, created_at")
        .in("ticket_id", ticketIds)
        .in("kind", ["layout", "thumbnail", "video"])
        .order("created_at", { ascending: false }),
      supabase
        .from("events")
        .select("id, name, event_date")
        .in("id", eventIds),
    ]);

    if (assetResult.error) {
      throw new Error(assetResult.error.message);
    }

    if (eventResult.error) {
      throw new Error(eventResult.error.message);
    }

    const eventsById = new Map((eventResult.data ?? []).map((event) => [event.id, event]));
    const assetsByTicket = new Map<string, typeof assetResult.data>();
    for (const asset of assetResult.data ?? []) {
      const ticketAssets = assetsByTicket.get(asset.ticket_id) ?? [];
      ticketAssets.push(asset);
      assetsByTicket.set(asset.ticket_id, ticketAssets);
    }

    const sessions = await Promise.all(
      tickets
        .filter((ticket) => assetsByTicket.has(ticket.id))
        .map(async (ticket) => ({
          ticketId: ticket.id,
          eventId: ticket.event_id,
          eventName: eventsById.get(ticket.event_id)?.name ?? "Photo Booth Event",
          eventDate: eventsById.get(ticket.event_id)?.event_date ?? null,
          queueNumber: ticket.queue_number,
          name: ticket.name,
          galleryUrl: `/gallery/${ticket.gallery_token_lookup}`,
          usedAt: ticket.used_at,
          assets: await serializeGalleryAssets(assetsByTicket.get(ticket.id) ?? []),
        })),
    );

    return NextResponse.json({
      phoneNumber,
      sessions,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
