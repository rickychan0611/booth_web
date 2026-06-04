import { corsJson, corsOptions, handleRouteError } from "@/lib/api";
import { updateTicketStatus } from "@/lib/queue/service";
import { boothCompleteSchema } from "@/lib/validation";

export function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  try {
    const body = boothCompleteSchema.parse(await request.json());
    const ticket = await updateTicketStatus({
      eventId: body.eventId,
      ticketId: body.ticketId,
      status: "used",
    });

    return corsJson({ ticket });
  } catch (error) {
    return handleRouteError(error);
  }
}
