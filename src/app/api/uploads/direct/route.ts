import { PutObjectCommand } from "@aws-sdk/client-s3";
import { corsJson, corsOptions, jsonError, handleRouteError } from "@/lib/api";
import { isAuthorizedBoothRequest } from "@/lib/auth/booth";
import { createR2Client, r2BucketName } from "@/lib/r2/client";
import { createServiceClient } from "@/lib/supabase/server";
import { photoKindSchema, uuidSchema } from "@/lib/validation";

export function OPTIONS() {
  return corsOptions();
}

function safeFilename(filename: string) {
  return filename.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
}

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function optionalPositiveInteger(value: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function POST(request: Request) {
  try {
    if (!isAuthorizedBoothRequest(request)) {
      return jsonError("Unauthorized booth request", 401);
    }

    const formData = await request.formData();
    const eventId = uuidSchema.parse(formString(formData, "eventId"));
    const ticketId = uuidSchema.parse(formString(formData, "ticketId"));
    const kind = photoKindSchema.parse(formString(formData, "kind"));
    const filename = safeFilename(formString(formData, "filename") || `${kind}.jpg`);
    const width = optionalPositiveInteger(formString(formData, "width"));
    const height = optionalPositiveInteger(formString(formData, "height"));
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("Missing upload file", 400);
    }

    const contentType = file.type || "application/octet-stream";
    const bytes = Buffer.from(await file.arrayBuffer());
    const key = `events/${eventId}/tickets/${ticketId}/${Date.now()}-${kind}-${filename}`;

    console.log("[uploads/direct] received", {
      eventId,
      ticketId,
      kind,
      filename,
      contentType,
      sizeBytes: bytes.byteLength,
      width,
      height,
    });

    await createR2Client().send(
      new PutObjectCommand({
        Bucket: r2BucketName(),
        Key: key,
        Body: bytes,
        ContentType: contentType,
      }),
    );

    console.log("[uploads/direct] uploaded to R2", { key });

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("photo_assets")
      .insert({
        event_id: eventId,
        ticket_id: ticketId,
        kind,
        r2_key: key,
        content_type: contentType,
        size_bytes: bytes.byteLength,
        width,
        height,
      })
      .select("*")
      .single();

    if (error) {
      console.error("[uploads/direct] Supabase insert failed", error);
      throw new Error(error.message);
    }

    console.log("[uploads/direct] saved asset", { id: data.id, key });
    return corsJson({ asset: data });
  } catch (error) {
    console.error("[uploads/direct] failed", error);
    return handleRouteError(error);
  }
}
