import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { createServiceClient } from "@/lib/supabase/server";
import { createEventSchema } from "@/lib/validation";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ events: data ?? [] });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = createEventSchema.parse(await request.json());
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("events")
      .insert({
        name: body.name,
        slug: body.slug ?? slugify(body.name),
        event_date: body.eventDate ?? null,
        status: "active",
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ event: data });
  } catch (error) {
    return handleRouteError(error);
  }
}
