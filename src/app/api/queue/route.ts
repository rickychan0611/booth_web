import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { getQueueSnapshot } from "@/lib/queue/service";
import { uuidSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const eventId = uuidSchema.parse(url.searchParams.get("eventId"));
    const snapshot = await getQueueSnapshot(eventId);

    return NextResponse.json(snapshot);
  } catch (error) {
    return handleRouteError(error);
  }
}
