import { normalizePhone } from "@/lib/phone";
import { cancelBooking, confirmBooking, expireStaleBookings } from "@/server/admin/bookings";
import { getDb } from "@/server/db";
import { AppError } from "@/server/errors";
import {
  scheduleBookingConfirmedNotification,
  scheduleBookingReleasedNotification,
} from "@/server/notifications/booking-notifications";

export type ReplyOutcome = "CONFIRMED" | "CANCELLED" | "IGNORED";

/**
 * Applies the customer's WhatsApp answer to a waiting booking. When `fromPhone` is given (real webhook),
 * it must be the phone the booking was made with. Replies that no longer apply are ignored, not errors.
 */
export async function applyCustomerReply(bookingId: string, action: "confirm" | "cancel", fromPhone?: string): Promise<ReplyOutcome> {
  const booking = await getDb().booking.findUnique({ where: { id: bookingId }, select: { status: true, customerPhone: true } });
  if (!booking || booking.status !== "PENDING") return "IGNORED";
  if (fromPhone !== undefined && normalizePhone(fromPhone.startsWith("+") ? fromPhone : `+${fromPhone}`) !== booking.customerPhone) {
    return "IGNORED";
  }

  const now = new Date();
  try {
    if (action === "confirm") {
      await confirmBooking(bookingId, now, "CUSTOMER");
      scheduleBookingConfirmedNotification(bookingId, "CUSTOMER");
      return "CONFIRMED";
    }
    await cancelBooking(bookingId, now, "CUSTOMER");
    scheduleBookingReleasedNotification(bookingId, "CUSTOMER");
    return "CANCELLED";
  } catch (error) {
    if (error instanceof AppError) return "IGNORED";
    throw error;
  }
}

/** Marks waiting bookings past their deadline as cancelled and notifies both sides. Never throws. */
export async function sweepExpiredBookings(): Promise<void> {
  try {
    const expired = await expireStaleBookings();
    for (const id of expired) scheduleBookingReleasedNotification(id, "EXPIRED");
  } catch (error) {
    console.error("[booking] expiry sweep failed", error);
  }
}
