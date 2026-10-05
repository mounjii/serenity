import type { Prisma } from "@/generated/prisma/client";
import { CONFIRMATION_CUTOFF_BEFORE_START_MINUTES, CONFIRMATION_WINDOW_MINUTES } from "@/lib/booking-rules";
import { addMinutes } from "@/lib/time";

/**
 * Bookings that keep their time slot blocked: confirmed or completed ones, and waiting ones whose
 * confirmation deadline has not passed. Expired waiting bookings free the slot immediately, even
 * before the sweep has marked them cancelled.
 */
export function holdsSlot(now: Date): Prisma.BookingWhereInput {
  return {
    OR: [
      { status: { in: ["CONFIRMED", "COMPLETED"] } },
      { status: "PENDING", OR: [{ confirmationExpiresAt: null }, { confirmationExpiresAt: { gt: now } }] },
    ],
  };
}

/** Customer must confirm within the window, and never later than the cutoff before the session. */
export function confirmationDeadline(now: Date, startAt: Date): Date {
  const windowEnd = addMinutes(now, CONFIRMATION_WINDOW_MINUTES);
  const cutoff = addMinutes(startAt, -CONFIRMATION_CUTOFF_BEFORE_START_MINUTES);
  return windowEnd < cutoff ? windowEnd : cutoff;
}
