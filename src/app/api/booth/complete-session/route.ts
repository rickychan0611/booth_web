import { NextResponse } from "next/server";
import { jsonError, handleRouteError } from "@/lib/api";
import { isAuthorizedBoothRequest } from "@/lib/auth/booth";
import { updateTicketStatus } from "@/lib/queue/service";
import { boothCompleteSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    if (!isAuthorizedBoothRequest(request)) {
      return jsonError("Unauthorized booth request", 401);
    }

    const body = boothCompleteSchema.parse(await request.json());
    const ticket = await updateTicketStatus({
      eventId: body.eventId,
      ticketId: body.ticketId,
      status: "used",
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    return handleRouteError(error);
  }
}
