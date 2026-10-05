export type BookingStatusValue = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export const STATUS_LABEL: Record<BookingStatusValue, string> = {
  PENDING: "Waiting",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const CANCEL_REASON_LABEL: Record<"CUSTOMER" | "ADMIN" | "EXPIRED", string> = {
  CUSTOMER: "by the client",
  ADMIN: "by admin",
  EXPIRED: "no WhatsApp reply",
};

/** Statuses that keep the time slot blocked. */
export const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED"] as const satisfies readonly BookingStatusValue[];

type Actionable = { status: BookingStatusValue; startAt: string | Date };

const isFuture = (booking: Actionable, now: Date) => new Date(booking.startAt).getTime() > now.getTime();

/** Same rules on the dashboard and on the server: cancel only future bookings that are still open. */
export function canCancel(booking: Actionable, now = new Date()): boolean {
  return (booking.status === "CONFIRMED" || booking.status === "PENDING") && isFuture(booking, now);
}

/** A waiting booking can be confirmed (by the customer on WhatsApp, or by the admin) until it starts. */
export function canConfirm(booking: Actionable, now = new Date()): boolean {
  return booking.status === "PENDING" && isFuture(booking, now);
}

/** Mark as completed only once the massage has started. */
export function canComplete(booking: Actionable, now = new Date()): boolean {
  return booking.status === "CONFIRMED" && !isFuture(booking, now);
}
