import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { advanceQueue } from "@/lib/queue/service";
import { uuidSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventId = uuidSchema.parse(body.eventId);
    const event = await advanceQueue(eventId);

    return NextResponse.json({ event });
  } catch (error) {
    return handleRouteError(error);
  }
}
