import { describe, expect, it } from "vitest";
import { constantTimeEquals, generateAccessCode, generateGalleryToken, hashSecret } from "@/lib/codes";

describe("code helpers", () => {
  it("generates six-digit access codes", () => {
    expect(generateAccessCode()).toMatch(/^\d{6}$/);
  });

  it("generates high entropy gallery tokens", () => {
    expect(generateGalleryToken()).toHaveLength(43);
  });

  it("compares hashes without plain equality", () => {
    const hash = hashSecret("123456");

    expect(constantTimeEquals(hash, hashSecret("123456"))).toBe(true);
    expect(constantTimeEquals(hash, hashSecret("654321"))).toBe(false);
  });
});
