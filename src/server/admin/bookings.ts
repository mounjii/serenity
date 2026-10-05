import type { Prisma } from "@/generated/prisma/client";
import { canCancel, canComplete, canConfirm, type BookingStatusValue } from "@/lib/booking-status";
import { addDays, formatLongDate, isValidDateString, localToUtc, toLocalDateString, toLocalTimeString } from "@/lib/time";
import { holdsSlot } from "@/server/booking/slot-hold";
import { getDb } from "@/server/db";
import { businessRule, notFound } from "@/server/errors";

export type CancelReason = "CUSTOMER" | "ADMIN" | "EXPIRED";
const CANCEL_REASONS: readonly string[] = ["CUSTOMER", "ADMIN", "EXPIRED"] satisfies CancelReason[];
const toCancelReason = (value: string | null): CancelReason | null =>
  value && CANCEL_REASONS.includes(value) ? (value as CancelReason) : null;

export const adminBookingSelect = {
  id: true,
  startAt: true,
  endAt: true,
  durationMinutes: true,
  priceCents: true,
  customerName: true,
  customerPhone: true,
  note: true,
  status: true,
  source: true,
  createdAt: true,
  updatedAt: true,
  confirmationExpiresAt: true,
  confirmedAt: true,
  cancelledAt: true,
  cancelReason: true,
  completedAt: true,
  service: { select: { name: true } },
  therapist: { select: { name: true } },
} satisfies Prisma.BookingSelect;

type AdminBookingRow = Prisma.BookingGetPayload<{ select: typeof adminBookingSelect }>;

/** Serializable booking for admin pages and the polling endpoint. */
export type AdminBooking = {
  id: string;
  serviceName: string;
  therapistName: string;
  startAt: string;
  endAt: string;
  date: string;
  dateLabel: string;
  time: string;
  endTime: string;
  durationMinutes: number;
  priceCents: number;
  customerName: string;
  customerPhone: string;
  note: string | null;
  status: BookingStatusValue;
  source: "ONLINE" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  confirmationExpiresAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  cancelReason: CancelReason | null;
  completedAt: string | null;
  /** Salon-time labels formatted on the server; browsers may ship outdated Africa/Casablanca rules. */
  labels: {
    confirmUntil: string | null;
    created: string;
    confirmed: string | null;
    cancelled: string | null;
    completed: string | null;
  };
};

const stamp = (instant: Date) => `${formatLongDate(instant)}, ${toLocalTimeString(instant)}`;

export function toAdminBooking(row: AdminBookingRow): AdminBooking {
  return {
    id: row.id,
    serviceName: row.service.name,
    therapistName: row.therapist.name,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    date: toLocalDateString(row.startAt),
    dateLabel: formatLongDate(row.startAt),
    time: toLocalTimeString(row.startAt),
    endTime: toLocalTimeString(row.endAt),
    durationMinutes: row.durationMinutes,
    priceCents: row.priceCents,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    note: row.note,
    status: row.status,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    confirmationExpiresAt: row.confirmationExpiresAt?.toISOString() ?? null,
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    cancelledAt: row.cancelledAt?.toISOString() ?? null,
    cancelReason: toCancelReason(row.cancelReason),
    completedAt: row.completedAt?.toISOString() ?? null,
    labels: {
      confirmUntil: row.status === "PENDING" && row.confirmationExpiresAt ? toLocalTimeString(row.confirmationExpiresAt) : null,
      created: stamp(row.createdAt),
      confirmed: row.confirmedAt ? stamp(row.confirmedAt) : null,
      cancelled: row.cancelledAt ? stamp(row.cancelledAt) : null,
      completed: row.completedAt ? stamp(row.completedAt) : null,
    },
  };
}

/** All bookings (any status) whose start falls on the local dates from..to inclusive. */
export async function listBookingsForDates(from: string, to: string): Promise<AdminBooking[]> {
  if (!isValidDateString(from) || !isValidDateString(to)) return [];
  const rows = await getDb().booking.findMany({
    where: { startAt: { gte: localToUtc(from, 0), lt: localToUtc(addDays(to, 1), 0) } },
    orderBy: [{ startAt: "asc" }, { createdAt: "asc" }],
    select: adminBookingSelect,
  });
  return rows.map(toAdminBooking);
}

export async function getDashboardSummary(now = new Date()) {
  const db = getDb();
  const today = toLocalDateString(now);
  const [todayCount, next] = await Promise.all([
    db.booking.count({
      where: { status: { not: "CANCELLED" }, startAt: { gte: localToUtc(today, 0), lt: localToUtc(addDays(today, 1), 0) } },
    }),
    db.booking.findFirst({
      where: { ...holdsSlot(now), status: { in: ["CONFIRMED", "PENDING"] }, startAt: { gt: now } },
      orderBy: { startAt: "asc" },
      select: adminBookingSelect,
    }),
  ]);
  return { today, todayCount, nextBooking: next ? toAdminBooking(next) : null };
}

export async function getAdminBooking(id: string): Promise<AdminBooking | null> {
  if (!/^[a-z0-9]{10,40}$/i.test(id)) return null;
  const row = await getDb().booking.findUnique({ where: { id }, select: adminBookingSelect });
  return row ? toAdminBooking(row) : null;
}

async function loadForUpdate(id: string) {
  const booking = await getAdminBooking(id);
  if (!booking) throw notFound("Reservation not found.");
  return booking;
}

/** Cancels a waiting or confirmed future booking, which frees its time slot. */
export async function cancelBooking(id: string, now = new Date(), reason: CancelReason = "ADMIN"): Promise<AdminBooking> {
  const booking = await loadForUpdate(id);
  if (!canCancel(booking, now)) {
    throw businessRule(
      "CANNOT_CANCEL",
      booking.status === "CANCELLED" || booking.status === "COMPLETED"
        ? "This reservation is already closed."
        : "Past reservations cannot be cancelled.",
    );
  }
  const { count } = await getDb().booking.updateMany({
    where: { id, status: { in: ["CONFIRMED", "PENDING"] }, startAt: { gt: now } },
    data: { status: "CANCELLED", cancelledAt: now, cancelReason: reason },
  });
  if (count === 0) throw businessRule("CANNOT_CANCEL", "This reservation can no longer be cancelled.");
  return loadForUpdate(id);
}

/**
 * Confirms a waiting booking. The customer must do it before the deadline; the admin can confirm
 * any time before the session as long as the slot was not freed and taken by someone else.
 */
export async function confirmBooking(id: string, now = new Date(), by: "CUSTOMER" | "ADMIN" = "ADMIN"): Promise<AdminBooking> {
  const booking = await loadForUpdate(id);
  if (!canConfirm(booking, now)) {
    throw businessRule(
      "CANNOT_CONFIRM",
      booking.status === "CONFIRMED" ? "This reservation is already confirmed." : "Only waiting reservations can be confirmed.",
    );
  }
  const deadlinePassed = booking.confirmationExpiresAt !== null && new Date(booking.confirmationExpiresAt) <= now;
  if (deadlinePassed && by === "CUSTOMER") {
    throw businessRule("CONFIRMATION_EXPIRED", "The time to confirm this reservation has passed.");
  }

  const db = getDb();
  if (deadlinePassed) {
    const row = await db.booking.findUniqueOrThrow({ where: { id }, select: { therapistId: true, startAt: true, blockedUntil: true } });
    const clash = await db.booking.count({
      where: { id: { not: id }, therapistId: row.therapistId, ...holdsSlot(now), startAt: { lt: row.blockedUntil }, blockedUntil: { gt: row.startAt } },
    });
    if (clash > 0) throw businessRule("SLOT_TAKEN", "This time has been booked by another client in the meantime.");
  }

  const { count } = await db.booking.updateMany({
    where: { id, status: "PENDING", startAt: { gt: now } },
    data: { status: "CONFIRMED", confirmedAt: now },
  });
  if (count === 0) throw businessRule("CANNOT_CONFIRM", "This reservation can no longer be confirmed.");
  return loadForUpdate(id);
}

/**
 * Waiting bookings whose confirmation deadline has passed become CANCELLED (reason EXPIRED).
 * Their slots are already free (see holdsSlot); this makes the status visible and returns the ids so
 * the caller can notify. Runs at most every 15 s per server process.
 */
let lastSweep = 0;
export async function expireStaleBookings(now = new Date()): Promise<string[]> {
  if (now.getTime() - lastSweep < 15_000) return [];
  lastSweep = now.getTime();
  const db = getDb();
  const stale = await db.booking.findMany({
    where: { status: "PENDING", confirmationExpiresAt: { lte: now } },
    select: { id: true },
    take: 100,
  });
  const expired: string[] = [];
  for (const { id } of stale) {
    const { count } = await db.booking.updateMany({
      where: { id, status: "PENDING", confirmationExpiresAt: { lte: now } },
      data: { status: "CANCELLED", cancelledAt: now, cancelReason: "EXPIRED" },
    });
    if (count === 1) expired.push(id);
  }
  return expired;
}

export async function completeBooking(id: string, now = new Date()): Promise<AdminBooking> {
  const booking = await loadForUpdate(id);
  if (!canComplete(booking, now)) {
    throw businessRule(
      "CANNOT_COMPLETE",
      booking.status !== "CONFIRMED"
        ? "Only confirmed reservations can be marked as completed."
        : "A reservation can only be marked as completed once it has started.",
    );
  }
  const { count } = await getDb().booking.updateMany({
    where: { id, status: "CONFIRMED", startAt: { lte: now } },
    data: { status: "COMPLETED", completedAt: now },
  });
  if (count === 0) throw businessRule("CANNOT_COMPLETE", "This reservation can no longer be marked as completed.");
  return loadForUpdate(id);
}
