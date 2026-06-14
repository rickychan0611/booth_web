import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { sendBookingInquiryEmail } from "@/lib/email/booking";
import { createServiceClient } from "@/lib/supabase/server";
import { bookingInquirySchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = bookingInquirySchema.parse(await request.json());
    const supabase = createServiceClient();
    const { error } = await supabase.from("booking_inquiries").insert({
      name: body.name,
      email: body.email,
      event_date: body.eventDate || null,
      city: body.city || null,
      notes: body.notes || null,
    });

    if (error) {
      throw new Error(error.message);
    }

    await sendBookingInquiryEmail(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
