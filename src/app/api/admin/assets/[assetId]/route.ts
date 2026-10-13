import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api";
import { getAdminUser, isSameOriginMutation } from "@/lib/auth/admin";
import { createR2Client, r2BucketName } from "@/lib/r2/client";
import { createServiceClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ assetId: string }> },
) {
  try {
    if (!isSameOriginMutation(request)) return jsonError("Invalid request origin", 403);
    if (!(await getAdminUser())) return jsonError("Administrator sign-in required", 401);

    const { assetId } = await context.params;
    uuidSchema.parse(assetId);

    const supabase = createServiceClient();
    const { data: asset, error: assetError } = await supabase
      .from("photo_assets")
      .select("id, r2_key")
      .eq("id", assetId)
      .single();

    if (assetError || !asset) return jsonError("File not found", 404);

    await createR2Client().send(
      new DeleteObjectCommand({
        Bucket: r2BucketName(),
        Key: asset.r2_key,
      }),
    );

    const { error: deleteError } = await supabase
      .from("photo_assets")
      .delete()
      .eq("id", assetId);
    if (deleteError) throw new Error(deleteError.message);

    return NextResponse.json({ deletedAssetId: assetId });
  } catch (error) {
    return handleRouteError(error);
  }
}
