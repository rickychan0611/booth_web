import { Resend } from "resend";

type BookingInquiryEmailInput = {
  name: string;
  email: string;
  eventDate?: string;
  city?: string;
  notes?: string;
};

function resendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

function bookingNotifyEmail() {
  const email = process.env.BOOKING_NOTIFY_EMAIL;
  if (!email) {
    throw new Error("BOOKING_NOTIFY_EMAIL is not configured");
  }
  return email;
}

function bookingFromEmail() {
  return process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendBookingInquiryEmail(input: BookingInquiryEmailInput) {
  const resend = resendClient();
  const eventDate = input.eventDate?.trim() || "Not provided";
  const city = input.city?.trim() || "Not provided";
  const notes = input.notes?.trim() || "Not provided";

  const { error } = await resend.emails.send({
    from: `Vibo Photo Booth <${bookingFromEmail()}>`,
    to: bookingNotifyEmail(),
    replyTo: input.email,
    subject: `New booking inquiry from ${input.name}`,
    html: `
      <h2>New Check Availability request</h2>
      <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>Event date:</strong> ${escapeHtml(eventDate)}</p>
      <p><strong>City:</strong> ${escapeHtml(city)}</p>
      <p><strong>Event notes:</strong></p>
      <p>${escapeHtml(notes).replaceAll("\n", "<br />")}</p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}
