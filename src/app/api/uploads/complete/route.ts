import { corsJson, corsOptions, jsonError, handleRouteError } from "@/lib/api";
import { isAuthorizedBoothRequest } from "@/lib/auth/booth";
import { createServiceClient } from "@/lib/supabase/server";
import { normalizeContentType } from "@/lib/uploads/assets";
import { completeUploadSchema } from "@/lib/validation";

export function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  try {
    if (!isAuthorizedBoothRequest(request)) {
      return jsonError("Unauthorized booth request", 401);
    }

    const body = completeUploadSchema.parse(await request.json());
    const supabase = createServiceClient();
    const rows = body.assets.map((asset) => ({
      event_id: body.eventId,
      ticket_id: body.ticketId,
      kind: asset.kind,
      r2_key: asset.r2Key,
      content_type: normalizeContentType(asset.contentType),
      size_bytes: asset.sizeBytes ?? null,
      width: asset.width ?? null,
      height: asset.height ?? null,
    }));
    const { data, error } = await supabase.from("photo_assets").insert(rows).select("*");

    if (error) {
      throw new Error(error.message);
    }

    return corsJson({ assets: data ?? [] });
  } catch (error) {
    return handleRouteError(error);
  }
}
