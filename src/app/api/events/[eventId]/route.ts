import { NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api";
import { createServiceClient } from "@/lib/supabase/server";
import { updateEventSchema, uuidSchema } from "@/lib/validation";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await context.params;
    uuidSchema.parse(eventId);

    const body = updateEventSchema.parse(await request.json());
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("events")
      .update({
        name: body.name,
        slug: slugify(body.name),
      })
      .eq("id", eventId)
      .select("*")
      .single();

    if (error || !data) {
      return jsonError("Event not found", 404);
    }

    return NextResponse.json({ event: data });
  } catch (error) {
    return handleRouteError(error);
  }
}
