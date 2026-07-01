import { hashSecret } from "@/lib/codes";
import { createServiceClient } from "@/lib/supabase/server";

type GalleryShareAsset = {
  id: string;
  kind: string;
  content_type: string;
  r2_key: string;
};

export async function getGalleryShareAsset(
  galleryToken: string,
  assetId: string,
): Promise<GalleryShareAsset | null> {
  const supabase = createServiceClient();
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, gallery_token_hash")
    .eq("gallery_token_lookup", galleryToken)
    .single();

  if (!ticket || ticket.gallery_token_hash !== hashSecret(galleryToken)) {
    return null;
  }

  const { data: asset } = await supabase
    .from("photo_assets")
    .select("id, kind, content_type, r2_key")
    .eq("ticket_id", ticket.id)
    .eq("id", assetId)
    .in("kind", ["layout", "video"])
    .maybeSingle();

  return asset;
}
