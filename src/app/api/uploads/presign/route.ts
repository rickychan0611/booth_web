import { NextResponse } from "next/server";
import { jsonError, handleRouteError } from "@/lib/api";
import { isAuthorizedBoothRequest } from "@/lib/auth/booth";
import { createPresignedPutUrl } from "@/lib/r2/urls";
import { presignUploadSchema } from "@/lib/validation";

function safeFilename(filename: string) {
  return filename.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
}

export async function POST(request: Request) {
  try {
    if (!isAuthorizedBoothRequest(request)) {
      return jsonError("Unauthorized booth request", 401);
    }

    const body = presignUploadSchema.parse(await request.json());
    const uploads = await Promise.all(
      body.assets.map(async (asset, index) => {
        const key = `events/${body.eventId}/tickets/${body.ticketId}/${String(index + 1).padStart(3, "0")}-${asset.kind}-${safeFilename(asset.filename)}`;
        return {
          kind: asset.kind,
          r2Key: key,
          uploadUrl: await createPresignedPutUrl({
            key,
            contentType: asset.contentType,
          }),
        };
      }),
    );

    return NextResponse.json({ uploads });
  } catch (error) {
    return handleRouteError(error);
  }
}
