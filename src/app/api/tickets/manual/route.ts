import { generateAccessCode, generateGalleryToken, hashSecret, lastFour } from "@/lib/codes";
import { corsJson, corsOptions, handleRouteError } from "@/lib/api";
import { createManualTicket } from "@/lib/queue/service";
import { manualTicketSchema } from "@/lib/validation";

export function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  try {
    const body = manualTicketSchema.parse(await request.json());
    const accessCode = generateAccessCode();
    const galleryToken = generateGalleryToken();
    const ticket = await createManualTicket({
      eventId: body.eventId,
      accessCode,
      accessCodeHash: hashSecret(accessCode),
      accessCodeLast4: lastFour(accessCode),
      galleryTokenHash: hashSecret(galleryToken),
      galleryTokenLookup: galleryToken,
      paymentMethod: body.paymentMethod,
    });

    return corsJson({
      ticket,
      accessCode,
      galleryUrl: `/gallery/${galleryToken}`,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
