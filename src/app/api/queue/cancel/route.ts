import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { updateTicketStatus } from "@/lib/queue/service";
import { queueTicketActionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = queueTicketActionSchema.parse(await request.json());
    const ticket = await updateTicketStatus({ ...body, status: "cancelled" });

    return NextResponse.json({ ticket });
  } catch (error) {
    return handleRouteError(error);
  }
}
