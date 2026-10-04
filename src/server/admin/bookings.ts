import type { Prisma } from "@/generated/prisma/client";
import { canCancel, canComplete, type BookingStatusValue } from "@/lib/booking-status";
import { addDays, formatLongDate, isValidDateString, localToUtc, toLocalDateString, toLocalTimeString } from "@/lib/time";
import { getDb } from "@/server/db";
import { businessRule, notFound } from "@/server/errors";

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
  cancelledAt: true,
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
  cancelledAt: string | null;
  completedAt: string | null;
};

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
    cancelledAt: row.cancelledAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
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
      where: { status: "CONFIRMED", startAt: { gt: now } },
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

export async function cancelBooking(id: string, now = new Date()): Promise<AdminBooking> {
  const booking = await loadForUpdate(id);
  if (!canCancel(booking, now)) {
    throw businessRule(
      "CANNOT_CANCEL",
      booking.status !== "CONFIRMED" ? "Only confirmed reservations can be cancelled." : "Past reservations cannot be cancelled.",
    );
  }
  const db = getDb();
  const { count } = await db.booking.updateMany({
    where: { id, status: "CONFIRMED", startAt: { gt: now } },
    data: { status: "CANCELLED", cancelledAt: now },
  });
  if (count === 0) throw businessRule("CANNOT_CANCEL", "This reservation can no longer be cancelled.");
  return loadForUpdate(id);
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
