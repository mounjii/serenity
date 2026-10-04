import { z } from "zod";
import { CUSTOMER_NAME_MAX, CUSTOMER_NAME_MIN, NOTE_MAX } from "./booking-rules";
import { normalizePhone } from "./phone";

/** Shared by the reservation form (client) and createBooking (server) so both apply the same rules. */

export const customerNameSchema = z
  .string({ error: "Please enter your name." })
  .transform((value) => value.replace(/\s+/g, " ").trim())
  .pipe(
    z
      .string()
      .min(CUSTOMER_NAME_MIN, `Name must be at least ${CUSTOMER_NAME_MIN} characters.`)
      .max(CUSTOMER_NAME_MAX, `Name must be at most ${CUSTOMER_NAME_MAX} characters.`),
  );

export const customerPhoneSchema = z
  .string({ error: "Please enter your phone number." })
  .max(32, "Please enter a valid phone number.")
  .transform((value, ctx) => {
    const normalized = normalizePhone(value);
    if (!normalized) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid phone number." });
      return z.NEVER;
    }
    return normalized;
  });

export const noteSchema = z
  .string()
  .max(NOTE_MAX, `Note must be at most ${NOTE_MAX} characters.`)
  .optional()
  .nullable()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  });

export const customerDetailsSchema = z.object({
  customerName: customerNameSchema,
  customerPhone: customerPhoneSchema,
  note: noteSchema,
});

export const createBookingSchema = customerDetailsSchema.extend({
  serviceId: z.string().min(1).max(40),
  startAt: z.iso.datetime({ offset: true, error: "Invalid start time." }),
  idempotencyKey: z.string().min(8).max(100).optional(),
  website: z.string().max(500).optional(),
});

export type CreateBookingInput = z.input<typeof createBookingSchema>;
export type CustomerDetailsInput = z.input<typeof customerDetailsSchema>;
