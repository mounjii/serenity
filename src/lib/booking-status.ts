export type BookingStatusValue = "CONFIRMED" | "COMPLETED" | "CANCELLED";

export const STATUS_LABEL: Record<BookingStatusValue, string> = {
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

type Actionable = { status: BookingStatusValue; startAt: string | Date };

/** Same rules on the dashboard and on the server: cancel only future bookings. */
export function canCancel(booking: Actionable, now = new Date()): boolean {
  return booking.status === "CONFIRMED" && new Date(booking.startAt).getTime() > now.getTime();
}

/** Mark as completed only once the massage has started. */
export function canComplete(booking: Actionable, now = new Date()): boolean {
  return booking.status === "CONFIRMED" && new Date(booking.startAt).getTime() <= now.getTime();
}
