import { NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api";
import { optionalEnv } from "@/lib/env";
import { createStripeClient } from "@/lib/stripe/client";

export async function POST(request: Request) {
  try {
    const stripe = createStripeClient();
    const webhookSecret = optionalEnv("STRIPE_WEBHOOK_SECRET");

    if (!stripe || !webhookSecret) {
      return jsonError("Stripe is not configured", 503);
    }

    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return jsonError("Missing Stripe signature", 400);
    }

    const rawBody = await request.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      return NextResponse.json({
        received: true,
        ticketCreation: "planned_for_future_release",
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
