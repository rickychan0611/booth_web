import { NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api";
import { serializeGalleryAssets } from "@/lib/gallery/assets";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await context.params;
    const supabase = createServiceClient();

    const [eventResult, ticketResult, assetResult] = await Promise.all([
      supabase.from("events").select("id, name").eq("id", eventId).single(),
      supabase
        .from("tickets")
        .select("id, queue_number, gallery_token_lookup, name, phone_number, used_at, created_at")
        .eq("event_id", eventId)
        .order("queue_number", { ascending: true }),
      supabase
        .from("photo_assets")
        .select("id, ticket_id, kind, content_type, r2_key, width, height, created_at")
        .eq("event_id", eventId)
        .in("kind", ["layout", "thumbnail", "video"])
        .order("created_at", { ascending: false }),
    ]);

    if (eventResult.error || !eventResult.data) {
      return jsonError("Event not found", 404);
    }

    if (ticketResult.error) {
      throw new Error(ticketResult.error.message);
    }

    if (assetResult.error) {
      throw new Error(assetResult.error.message);
    }

    const assetsByTicket = new Map<string, typeof assetResult.data>();
    for (const asset of assetResult.data ?? []) {
      const ticketAssets = assetsByTicket.get(asset.ticket_id) ?? [];
      ticketAssets.push(asset);
      assetsByTicket.set(asset.ticket_id, ticketAssets);
    }

    const sessions = await Promise.all(
      (ticketResult.data ?? [])
        .filter((ticket) => assetsByTicket.has(ticket.id))
        .map(async (ticket) => ({
          ticketId: ticket.id,
          queueNumber: ticket.queue_number,
          name: ticket.name,
          phoneNumber: ticket.phone_number,
          galleryUrl: `/gallery/${ticket.gallery_token_lookup}`,
          usedAt: ticket.used_at,
          createdAt: ticket.created_at,
          assets: await serializeGalleryAssets(assetsByTicket.get(ticket.id) ?? []),
        })),
    );

    return NextResponse.json({
      event: eventResult.data,
      sessions,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
