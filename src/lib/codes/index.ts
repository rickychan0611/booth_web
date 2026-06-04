import { createHash, randomBytes, randomInt, timingSafeEqual } from "crypto";

export function generateAccessCode() {
  return randomInt(1000, 9999).toString();
}

export function generateGalleryToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export function constantTimeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function lastFour(value: string) {
  return value.slice(-4);
}
