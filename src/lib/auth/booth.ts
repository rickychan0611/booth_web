import { constantTimeEquals, hashSecret } from "@/lib/codes";
import { optionalEnv } from "@/lib/env";

export function isAuthorizedBoothRequest(request: Request) {
  const configuredSecret = optionalEnv("BOOTH_SHARED_SECRET");

  if (!configuredSecret) {
    return false;
  }

  const provided = request.headers.get("x-booth-secret") || "";

  if (!provided) {
    return false;
  }

  return constantTimeEquals(hashSecret(provided), hashSecret(configuredSecret));
}
