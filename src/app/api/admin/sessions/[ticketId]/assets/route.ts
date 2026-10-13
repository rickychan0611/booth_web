import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api";
import { getAdminUser, isSameOriginMutation } from "@/lib/auth/admin";
import { createR2Client, r2BucketName } from "@/lib/r2/client";
import { createServiceClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ ticketId: string }> },
) {
  try {
    if (!isSameOriginMutation(request)) return jsonError("Invalid request origin", 403);
    if (!(await getAdminUser())) return jsonError("Administrator sign-in required", 401);

    const { ticketId } = await context.params;
    uuidSchema.parse(ticketId);

    const supabase = createServiceClient();
    const { data: assets, error: assetError } = await supabase
      .from("photo_assets")
      .select("id, r2_key")
      .eq("ticket_id", ticketId);
    if (assetError) throw new Error(assetError.message);
    if (!assets?.length) return jsonError("Gallery files not found", 404);

    await createR2Client().send(
      new DeleteObjectsCommand({
        Bucket: r2BucketName(),
        Delete: {
          Objects: assets.map((asset) => ({ Key: asset.r2_key })),
          Quiet: true,
        },
      }),
    );

    const { error: deleteError } = await supabase
      .from("photo_assets")
      .delete()
      .eq("ticket_id", ticketId);
    if (deleteError) throw new Error(deleteError.message);

    return NextResponse.json({
      deletedTicketId: ticketId,
      deletedFileCount: assets.length,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
