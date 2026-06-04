import { corsJson, corsOptions, handleRouteError } from "@/lib/api";
import { getQueueSnapshot } from "@/lib/queue/service";
import { uuidSchema } from "@/lib/validation";

export function OPTIONS() {
  return corsOptions();
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const eventId = uuidSchema.parse(url.searchParams.get("eventId"));
    const snapshot = await getQueueSnapshot(eventId);

    return corsJson(snapshot);
  } catch (error) {
    return handleRouteError(error);
  }
}
