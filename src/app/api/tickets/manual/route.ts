import { NextResponse } from "next/server";
import { generateAccessCode, generateGalleryToken, hashSecret, lastFour } from "@/lib/codes";
import { handleRouteError } from "@/lib/api";
import { createManualTicket } from "@/lib/queue/service";
import { manualTicketSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = manualTicketSchema.parse(await request.json());
    const accessCode = generateAccessCode();
    const galleryToken = generateGalleryToken();
    const ticket = await createManualTicket({
      eventId: body.eventId,
      accessCodeHash: hashSecret(accessCode),
      accessCodeLast4: lastFour(accessCode),
      galleryTokenHash: hashSecret(galleryToken),
      galleryTokenLookup: galleryToken,
      paymentMethod: body.paymentMethod,
    });

    return NextResponse.json({
      ticket,
      accessCode,
      galleryUrl: `/gallery/${galleryToken}`,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
