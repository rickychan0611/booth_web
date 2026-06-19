import { NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api";
import { pickListPreviewAsset, serializeGalleryAsset } from "@/lib/gallery/assets";
import { createServiceClient } from "@/lib/supabase/server";

export const EVENT_GALLERY_PAGE_SIZE = 20;

type TicketRow = {
  id: string;
  queue_number: number;
  gallery_token_lookup: string;
  name: string | null;
  phone_number: string | null;
  used_at: string | null;
  created_at: string;
};

type AssetRow = {
  id: string;
  ticket_id: string;
  kind: string;
  content_type: string;
  r2_key: string;
  width: number | null;
  height: number | null;
  created_at: string;
};

function parseListQuery(url: URL) {
  const metadataOnly = url.searchParams.get("metadataOnly") === "1";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const search = url.searchParams.get("search")?.trim() ?? "";
  const defaultLimit = metadataOnly ? 5000 : EVENT_GALLERY_PAGE_SIZE;
  const requestedLimit = Number(url.searchParams.get("limit") ?? String(defaultLimit)) || defaultLimit;
  const limit = metadataOnly
    ? Math.min(Math.max(1, requestedLimit), 5000)
    : Math.min(Math.max(1, requestedLimit), 50);

  return { page, limit, metadataOnly, search };
}

function matchesSessionSearch(ticket: TicketRow, query: string) {
  const trimmed = query.trim().replace(/^#/, "");
  if (!trimmed) return true;

  const lower = trimmed.toLowerCase();
  const digits = trimmed.replace(/\D/g, "");

  if (ticket.name?.toLowerCase().includes(lower)) {
    return true;
  }

  if (/^\d+$/.test(trimmed)) {
    if (ticket.queue_number === Number(trimmed)) {
      return true;
    }

    const phoneDigits = ticket.phone_number?.replace(/\D/g, "") ?? "";
    return phoneDigits.includes(trimmed);
  }

  if (digits) {
    const phoneDigits = ticket.phone_number?.replace(/\D/g, "") ?? "";
    if (phoneDigits.includes(digits)) {
      return true;
    }
  }

  return ticket.phone_number?.toLowerCase().includes(lower) ?? false;
}

function sortTicketsLatestFirst(tickets: TicketRow[]) {
  return [...tickets].sort((left, right) => {
    const leftTime = new Date(left.used_at ?? left.created_at).getTime();
    const rightTime = new Date(right.used_at ?? right.created_at).getTime();
    return rightTime - leftTime;
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await context.params;
    const { page, limit, metadataOnly, search } = parseListQuery(new URL(request.url));
    const supabase = createServiceClient();

    const [eventResult, ticketResult, assetResult] = await Promise.all([
      supabase.from("events").select("id, name").eq("id", eventId).single(),
      supabase
        .from("tickets")
        .select("id, queue_number, gallery_token_lookup, name, phone_number, used_at, created_at")
        .eq("event_id", eventId),
      supabase
        .from("photo_assets")
        .select("id, ticket_id, kind, content_type, r2_key, width, height, created_at")
        .eq("event_id", eventId)
        .in("kind", ["layout", "thumbnail", "video"]),
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

    const assetsByTicket = new Map<string, AssetRow[]>();
    for (const asset of (assetResult.data ?? []) as AssetRow[]) {
      const ticketAssets = assetsByTicket.get(asset.ticket_id) ?? [];
      ticketAssets.push(asset);
      assetsByTicket.set(asset.ticket_id, ticketAssets);
    }

    const sortedTickets = sortTicketsLatestFirst(
      (ticketResult.data ?? []).filter((ticket) => assetsByTicket.has(ticket.id)) as TicketRow[],
    );
    const filteredTickets = search
      ? sortedTickets.filter((ticket) => matchesSessionSearch(ticket, search))
      : sortedTickets;

    const totalSessions = filteredTickets.length;
    const totalPages = Math.max(1, Math.ceil(totalSessions / limit));
    const currentPage = Math.min(page, totalPages);
    const offset = (currentPage - 1) * limit;
    const pageTickets = metadataOnly ? filteredTickets : filteredTickets.slice(offset, offset + limit);

    const sessions = await Promise.all(
      pageTickets.map(async (ticket) => {
        const ticketAssets = assetsByTicket.get(ticket.id) ?? [];
        const previewAsset = metadataOnly ? null : pickListPreviewAsset(ticketAssets);

        return {
          ticketId: ticket.id,
          queueNumber: ticket.queue_number,
          name: ticket.name,
          phoneNumber: ticket.phone_number,
          galleryUrl: `/gallery/${ticket.gallery_token_lookup}`,
          usedAt: ticket.used_at,
          createdAt: ticket.created_at,
          assetCount: ticketAssets.length,
          preview: previewAsset ? await serializeGalleryAsset(previewAsset) : null,
        };
      }),
    );

    const totalAssets = [...assetsByTicket.values()].reduce((count, assets) => count + assets.length, 0);

    return NextResponse.json({
      event: eventResult.data,
      sessions,
      pagination: {
        page: currentPage,
        pageSize: limit,
        totalSessions,
        totalPages,
        totalAssets,
        search,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
