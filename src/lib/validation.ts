import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const paymentMethodSchema = z.enum([
  "manual_cash",
  "manual_card",
  "manual_etransfer",
  "manual_other",
  "stripe",
]);

export const photoKindSchema = z.enum(["original", "layout", "thumbnail", "video"]);

export const ticketStatusSchema = z.enum(["waiting", "active", "skipped", "cancelled", "used"]);

export const createEventSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  eventDate: z.string().datetime().optional(),
});

export const manualTicketSchema = z.object({
  eventId: uuidSchema,
  paymentMethod: paymentMethodSchema.exclude(["stripe"]),
});

export const queueTicketActionSchema = z.object({
  eventId: uuidSchema,
  ticketId: uuidSchema,
});

export const queueResetSchema = z.object({
  eventId: uuidSchema,
  currentQueueNumber: z.number().int().positive(),
  nextQueueNumber: z.number().int().positive(),
});

export const boothValidateSchema = z.object({
  eventId: uuidSchema,
  accessCode: z.string().min(4).max(24),
});

export const boothCompleteSchema = z.object({
  eventId: uuidSchema,
  ticketId: uuidSchema,
});

export const presignUploadSchema = z.object({
  eventId: uuidSchema,
  ticketId: uuidSchema,
  assets: z.array(
    z.object({
      kind: photoKindSchema,
      filename: z.string().min(1),
      contentType: z.string().min(3),
    }),
  ),
});

export const completeUploadSchema = z.object({
  eventId: uuidSchema,
  ticketId: uuidSchema,
  assets: z.array(
    z.object({
      kind: photoKindSchema,
      r2Key: z.string().min(1),
      contentType: z.string().min(3),
      sizeBytes: z.number().int().nonnegative().optional(),
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
    }),
  ),
});

export const landingContentSchema = z.object({
  businessName: z.string().min(1),
  headline: z.string().min(1),
  subheadline: z.string().optional(),
  ctaText: z.string().min(1),
  colors: z.object({
    background: z.string().min(1),
    foreground: z.string().min(1),
    accent: z.string().min(1),
  }),
  sections: z.object({
    howItWorks: z.array(z.string()).optional(),
    packages: z
      .array(z.object({ name: z.string(), price: z.string().optional(), description: z.string() }))
      .optional(),
    galleryAssetIds: z.array(z.string()).optional(),
    eventDetails: z.record(z.string(), z.string()).optional(),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
  }),
});
