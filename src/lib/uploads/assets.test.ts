import { describe, expect, it } from "vitest";
import {
  buildR2AssetKey,
  isAllowedUploadContentType,
  normalizeOptionalDimension,
  parseOptionalDimensions,
} from "@/lib/uploads/assets";

describe("upload assets", () => {
  it("allows video MIME types for video kind", () => {
    expect(isAllowedUploadContentType("video", "video/mp4")).toBe(true);
    expect(isAllowedUploadContentType("video", "video/webm")).toBe(true);
    expect(isAllowedUploadContentType("video", "image/jpeg")).toBe(false);
  });

  it("places videos under a videos prefix", () => {
    const key = buildR2AssetKey({
      eventId: "evt",
      ticketId: "tkt",
      kind: "video",
      filename: "session.mp4",
    });
    expect(key).toMatch(/^events\/evt\/tickets\/tkt\/videos\//);
  });

  it("keeps photo keys on the ticket path", () => {
    const key = buildR2AssetKey({
      eventId: "evt",
      ticketId: "tkt",
      kind: "layout",
      filename: "layout.jpg",
      index: 0,
    });
    expect(key).toBe("events/evt/tickets/tkt/001-layout-layout.jpg");
  });

  it("treats zero dimensions as null", () => {
    expect(parseOptionalDimensions("0", "0")).toEqual({ width: null, height: null });
    expect(normalizeOptionalDimension(0)).toBeNull();
  });
});
