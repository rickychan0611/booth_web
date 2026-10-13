import { NextResponse } from "next/server";
import { hashSecret } from "@/lib/codes";
import { handleRouteError, jsonError } from "@/lib/api";
import { readEventBranding } from "@/lib/events/branding";
import { serializeGalleryAssets } from "@/lib/gallery/assets";
import { createPresignedGetUrl } from "@/lib/r2/urls";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ galleryToken: string }> },
) {
  try {
    const { galleryToken } = await context.params;
    const supabase = createServiceClient();
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("*")
      .eq("gallery_token_lookup", galleryToken)
      .single();

    if (ticketError || !ticket || ticket.gallery_token_hash !== hashSecret(galleryToken)) {
      return jsonError("Gallery not found", 404);
    }

    const [eventResult, assetResult] = await Promise.all([
      supabase.from("events").select("*").eq("id", ticket.event_id).single(),
      supabase
        .from("photo_assets")
        .select("*")
        .eq("ticket_id", ticket.id)
        .in("kind", ["layout", "video"])
        .order("created_at", { ascending: false }),
    ]);

    if (eventResult.error) {
      throw new Error(eventResult.error.message);
    }

    if (assetResult.error) {
      throw new Error(assetResult.error.message);
    }

    const assets = await serializeGalleryAssets(assetResult.data ?? []);
    const branding = readEventBranding(eventResult.data.branding);
    const bannerUrl = branding.galleryBannerR2Key
      ? await createPresignedGetUrl(branding.galleryBannerR2Key)
      : null;

    return NextResponse.json({
      event: {
        id: eventResult.data.id,
        name: eventResult.data.name,
        bannerUrl,
        bannerLinkUrl: branding.galleryBannerLinkUrl ?? null,
      },
      ticket: {
        queueNumber: ticket.queue_number,
      },
      assets,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
