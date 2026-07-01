import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api";
import { getGalleryShareAsset } from "@/lib/gallery/access";
import { createR2Client, r2BucketName } from "@/lib/r2/client";

export async function GET(
  _request: Request,
  context: { params: Promise<{ galleryToken: string; assetId: string }> },
) {
  try {
    const { galleryToken, assetId } = await context.params;
    const asset = await getGalleryShareAsset(galleryToken, assetId);

    if (!asset) {
      return jsonError("Asset not found", 404);
    }

    const object = await createR2Client().send(
      new GetObjectCommand({
        Bucket: r2BucketName(),
        Key: asset.r2_key,
      }),
    );

    if (!object.Body) {
      return jsonError("Asset not found", 404);
    }

    const bytes = await object.Body.transformToByteArray();

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": asset.content_type,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
