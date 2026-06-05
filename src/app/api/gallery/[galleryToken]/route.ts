import { NextResponse } from "next/server";
import { hashSecret } from "@/lib/codes";
import { handleRouteError, jsonError } from "@/lib/api";
import { createPresignedGetUrl } from "@/lib/r2/urls";
import { createServiceClient } from "@/lib/supabase/server";
import type { PhotoKind } from "@/types/database";

const GALLERY_KIND_ORDER: Record<PhotoKind, number> = {
  layout: 0,
  video: 1,
  original: 2,
  thumbnail: 3,
};

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

    const sortedAssets = [...(assetResult.data ?? [])].sort((left, right) => {
      const leftOrder = GALLERY_KIND_ORDER[left.kind as PhotoKind] ?? 99;
      const rightOrder = GALLERY_KIND_ORDER[right.kind as PhotoKind] ?? 99;
      return leftOrder - rightOrder;
    });

    const assets = await Promise.all(
      sortedAssets.map(async (asset) => ({
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
