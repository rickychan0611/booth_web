import Stripe from "stripe";
import { optionalEnv } from "@/lib/env";

export function createStripeClient() {
  const key = optionalEnv("STRIPE_SECRET_KEY");

  if (!key) {
    return null;
  }

  return new Stripe(key);
}
