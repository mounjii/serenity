import { getDb } from "@/server/db";
import { adminBookingSelect, toAdminBooking, type AdminBooking } from "./bookings";

/**
 * A transaction can stamp updatedAt slightly before it commits, so serverTime is moved back by this
 * margin: such rows are returned by the next poll instead of being missed. Clients de-duplicate by id + updatedAt.
 */
const COMMIT_LAG_MS = 5_000;
const MAX_ROWS = 200;

export type BookingChanges = { serverTime: string; bookings: AdminBooking[] };

export function pollingCursor(now = new Date()): string {
  return new Date(now.getTime() - COMMIT_LAG_MS).toISOString();
}

export async function listBookingChanges(since: Date): Promise<BookingChanges> {
  const serverTime = pollingCursor();
  const rows = await getDb().booking.findMany({
    where: { updatedAt: { gt: since } },
    orderBy: { updatedAt: "asc" },
    take: MAX_ROWS,
    select: adminBookingSelect,
  });
  // Page through large bursts: continue just before the last returned row (duplicates are de-duplicated client-side).
  const cursor = rows.length === MAX_ROWS ? new Date(rows[rows.length - 1].updatedAt.getTime() - 1).toISOString() : serverTime;
  return { serverTime: cursor, bookings: rows.map(toAdminBooking) };
}
