import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { getGalleryPublicMeta } from "@/lib/gallery/public-meta";
import { getSiteUrl } from "@/lib/site-url";
import { createR2Client, r2BucketName } from "@/lib/r2/client";

export async function GET(
  _request: Request,
  context: { params: Promise<{ galleryToken: string }> },
) {
  const { galleryToken } = await context.params;
  const meta = await getGalleryPublicMeta(galleryToken);

  if (!meta?.previewAsset) {
    return NextResponse.redirect(`${getSiteUrl()}/vibo-logo.png`, 302);
  }

  const object = await createR2Client().send(
    new GetObjectCommand({
      Bucket: r2BucketName(),
      Key: meta.previewAsset.r2_key,
    }),
  );

  if (!object.Body) {
    return NextResponse.redirect(`${getSiteUrl()}/vibo-logo.png`, 302);
  }

  const bytes = await object.Body.transformToByteArray();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": meta.previewAsset.content_type,
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
