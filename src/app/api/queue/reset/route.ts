import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { createServiceClient } from "@/lib/supabase/server";
import { queueResetSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = queueResetSchema.parse(await request.json());
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("events")
      .update({
        current_queue_number: body.currentQueueNumber,
        next_queue_number: body.nextQueueNumber,
      })
      .eq("id", body.eventId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await supabase.from("queue_actions").insert({
      event_id: body.eventId,
      action: "reset_queue",
      actor_type: "admin",
      metadata: {
        currentQueueNumber: body.currentQueueNumber,
        nextQueueNumber: body.nextQueueNumber,
      },
    });

    return NextResponse.json({ event: data });
  } catch (error) {
    return handleRouteError(error);
  }
}
