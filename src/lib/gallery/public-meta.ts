import { hashSecret } from "@/lib/codes";
import { createServiceClient } from "@/lib/supabase/server";

export type GalleryPublicMeta = {
  eventName: string;
  previewAsset: {
    r2_key: string;
    content_type: string;
  } | null;
};

export async function getGalleryPublicMeta(galleryToken: string): Promise<GalleryPublicMeta | null> {
  const supabase = createServiceClient();
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, event_id, gallery_token_hash")
    .eq("gallery_token_lookup", galleryToken)
    .single();

  if (!ticket || ticket.gallery_token_hash !== hashSecret(galleryToken)) {
    return null;
  }

  const [eventResult, previewResult] = await Promise.all([
    supabase.from("events").select("name").eq("id", ticket.event_id).single(),
    supabase
      .from("photo_assets")
      .select("r2_key, content_type")
      .eq("ticket_id", ticket.id)
      .eq("kind", "layout")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (eventResult.error || !eventResult.data) {
    return null;
  }

  return {
    eventName: eventResult.data.name,
    previewAsset: previewResult.data ?? null,
  };
}
