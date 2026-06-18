import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api";
import {
  clearGalleryBannerBranding,
  mergeEventBranding,
  readEventBranding,
} from "@/lib/events/branding";
import { createR2Client, r2BucketName } from "@/lib/r2/client";
import { createPresignedGetUrl } from "@/lib/r2/urls";
import { createServiceClient } from "@/lib/supabase/server";
import {
  buildGalleryBannerKey,
  isAllowedGalleryBannerContentType,
  MAX_GALLERY_BANNER_BYTES,
} from "@/lib/uploads/gallery-banner";
import { normalizeContentType } from "@/lib/uploads/assets";
import { uuidSchema } from "@/lib/validation";

export async function GET(
  _request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await context.params;
    uuidSchema.parse(eventId);

    const supabase = createServiceClient();
    const { data: event, error } = await supabase
      .from("events")
      .select("branding")
      .eq("id", eventId)
      .single();

    if (error || !event) {
      return jsonError("Event not found", 404);
    }

    const branding = readEventBranding(event.branding);
    if (!branding.galleryBannerR2Key) {
      return NextResponse.json({ bannerUrl: null });
    }

    const bannerUrl = await createPresignedGetUrl(branding.galleryBannerR2Key);

    return NextResponse.json({
      bannerUrl,
      contentType: branding.galleryBannerContentType ?? null,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await context.params;
    uuidSchema.parse(eventId);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("Missing banner image", 400);
    }

    if (file.size > MAX_GALLERY_BANNER_BYTES) {
      return jsonError("Banner image must be 5MB or smaller", 413);
    }

    const contentType = normalizeContentType(file.type || "application/octet-stream");
    if (!isAllowedGalleryBannerContentType(contentType)) {
      return jsonError("Banner must be a JPEG, PNG, or WebP image", 415);
    }

    const supabase = createServiceClient();
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, branding")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return jsonError("Event not found", 404);
    }

    const key = buildGalleryBannerKey(eventId, file.name);
    const bytes = Buffer.from(await file.arrayBuffer());

    await createR2Client().send(
      new PutObjectCommand({
        Bucket: r2BucketName(),
        Key: key,
        Body: bytes,
        ContentType: contentType,
      }),
    );

    const branding = mergeEventBranding(event.branding, {
      galleryBannerR2Key: key,
      galleryBannerContentType: contentType,
    });

    const { error: updateError } = await supabase
      .from("events")
      .update({ branding })
      .eq("id", eventId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const bannerUrl = await createPresignedGetUrl(key);

    return NextResponse.json({
      bannerUrl,
      contentType,
      branding,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await context.params;
    uuidSchema.parse(eventId);

    const supabase = createServiceClient();
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, branding")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return jsonError("Event not found", 404);
    }

    const branding = readEventBranding(event.branding);
    if (branding.galleryBannerR2Key) {
      await createR2Client().send(
        new DeleteObjectCommand({
          Bucket: r2BucketName(),
          Key: branding.galleryBannerR2Key,
        }),
      );
    }

    const nextBranding = clearGalleryBannerBranding(event.branding);
    const { error: updateError } = await supabase
      .from("events")
      .update({ branding: nextBranding })
      .eq("id", eventId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({ branding: nextBranding });
  } catch (error) {
    return handleRouteError(error);
  }
}
