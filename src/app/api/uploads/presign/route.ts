import { corsJson, corsOptions, jsonError, handleRouteError } from "@/lib/api";
import { isAuthorizedBoothRequest } from "@/lib/auth/booth";
import { createPresignedPutUrl } from "@/lib/r2/urls";
import { buildR2AssetKey, normalizeContentType } from "@/lib/uploads/assets";
import { presignUploadSchema } from "@/lib/validation";

export function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  try {
    if (!isAuthorizedBoothRequest(request)) {
      return jsonError("Unauthorized booth request", 401);
    }

    const body = presignUploadSchema.parse(await request.json());
    const uploads = await Promise.all(
      body.assets.map(async (asset, index) => {
        const key = buildR2AssetKey({
          eventId: body.eventId,
          ticketId: body.ticketId,
          kind: asset.kind,
          filename: asset.filename,
          index,
        });
        const contentType = normalizeContentType(asset.contentType);
        return {
          kind: asset.kind,
          r2Key: key,
          uploadUrl: await createPresignedPutUrl({
            key,
            contentType,
          }),
        };
      }),
    );

    return corsJson({ uploads });
  } catch (error) {
    return handleRouteError(error);
  }
}
