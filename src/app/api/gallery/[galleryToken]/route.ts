import { NextResponse } from "next/server";
import { hashSecret } from "@/lib/codes";
import { handleRouteError, jsonError } from "@/lib/api";
import { readEventBranding } from "@/lib/events/branding";
import { serializeGalleryAssets } from "@/lib/gallery/assets";
import { createPresignedGetUrl } from "@/lib/r2/urls";
import { createServiceClient } from "@/lib/supabase/server";
import { galleryNameSchema } from "@/lib/validation";

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
        name: eventResult.data.name,
        bannerUrl,
      },
      ticket: {
        name: ticket.name,
        queueNumber: ticket.queue_number,
      },
      assets,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ galleryToken: string }> },
) {
  try {
    const { galleryToken } = await context.params;
    const body = galleryNameSchema.parse(await request.json());
    const supabase = createServiceClient();
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("id, gallery_token_hash")
      .eq("gallery_token_lookup", galleryToken)
      .single();

    if (ticketError || !ticket || ticket.gallery_token_hash !== hashSecret(galleryToken)) {
      return jsonError("Gallery not found", 404);
    }

    const { data: updatedTicket, error: updateError } = await supabase
      .from("tickets")
      .update({ name: body.name })
      .eq("id", ticket.id)
      .select("name")
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error) {
    return handleRouteError(error);
  }
}
