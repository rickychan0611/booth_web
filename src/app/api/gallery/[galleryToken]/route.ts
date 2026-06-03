import { NextResponse } from "next/server";
import { hashSecret } from "@/lib/codes";
import { handleRouteError, jsonError } from "@/lib/api";
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
        .order("created_at", { ascending: true }),
    ]);

    if (eventResult.error) {
      throw new Error(eventResult.error.message);
    }

    if (assetResult.error) {
      throw new Error(assetResult.error.message);
    }

    const assets = await Promise.all(
      (assetResult.data ?? []).map(async (asset) => ({
        id: asset.id,
        kind: asset.kind,
        contentType: asset.content_type,
        width: asset.width,
        height: asset.height,
        viewUrl: await createPresignedGetUrl(asset.r2_key),
        downloadUrl: await createPresignedGetUrl(asset.r2_key),
      })),
    );

    return NextResponse.json({
      event: {
        name: eventResult.data.name,
      },
      assets,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
