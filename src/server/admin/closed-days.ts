import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { addDays, dateStringToDbDate, dbDateToDateString, formatLongDate, isValidDateString, localToUtc, toLocalDateString, weekdayOf } from "@/lib/time";
import { getDb } from "@/server/db";
import { AppError, businessRule, invalidInput, notFound } from "@/server/errors";
import { adminBookingSelect, toAdminBooking, type AdminBooking } from "./bookings";

export type ClosedDayItem = { id: string; date: string; label: string; reason: string | null };

export class DayHasBookingsError extends AppError {
  constructor(readonly bookings: AdminBooking[]) {
    super(
      409,
      "DAY_HAS_BOOKINGS",
      `This day still has ${bookings.length} active reservation${bookings.length > 1 ? "s" : ""}. Cancel ${bookings.length > 1 ? "them" : "it"} first, then close the day.`,
    );
  }
}

const closedDaySchema = z.object({
  date: z.string().refine(isValidDateString, "Please choose a valid date."),
  reason: z
    .string()
    .max(200, "Reason must be at most 200 characters.")
    .optional()
    .transform((v) => v?.trim() || undefined),
});

const toItem = (row: { id: string; date: Date; reason: string | null }): ClosedDayItem => {
  const date = dbDateToDateString(row.date);
  return { id: row.id, date, label: formatLongDate(new Date(`${date}T12:00:00.000Z`)), reason: row.reason };
};

export async function listUpcomingClosedDays(now = new Date()): Promise<ClosedDayItem[]> {
  const rows = await getDb().closedDay.findMany({
    where: { date: { gte: dateStringToDbDate(toLocalDateString(now)) } },
    orderBy: { date: "asc" },
  });
  return rows.map(toItem);
}

/**
 * Takes the same therapist lock as createBooking, so no reservation can be created on the day
 * between the "no active bookings" check and the insert.
 */
export async function addClosedDay(rawInput: unknown, now = new Date()): Promise<ClosedDayItem> {
  const input = closedDaySchema.parse(rawInput);
  if (input.date < toLocalDateString(now)) throw invalidInput("Choose today or a future date.", { date: "Choose today or a future date." });

  const db = getDb();
  const hours = await db.openingHours.findUnique({ where: { weekday: weekdayOf(input.date) } });
  if (!hours || hours.closed) throw businessRule("ALREADY_CLOSED", "The salon is already closed on this day of the week.");

  try {
    const row = await db.$transaction(
      async (tx) => {
        await tx.$executeRaw`SET SESSION innodb_lock_wait_timeout = 8`;
        await tx.$queryRaw`SELECT id FROM therapists WHERE active = 1 ORDER BY id FOR UPDATE`;

        const existing = await tx.closedDay.findUnique({ where: { date: dateStringToDbDate(input.date) }, select: { id: true } });
        if (existing) throw businessRule("ALREADY_CLOSED", "This day is already closed.");

        const active = await tx.booking.findMany({
          where: {
            status: "CONFIRMED",
            startAt: { gte: localToUtc(input.date, 0), lt: localToUtc(addDays(input.date, 1), 0) },
          },
          orderBy: { startAt: "asc" },
          select: adminBookingSelect,
        });
        if (active.length > 0) throw new DayHasBookingsError(active.map(toAdminBooking));

        return tx.closedDay.create({ data: { date: dateStringToDbDate(input.date), reason: input.reason ?? null } });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, maxWait: 5_000, timeout: 15_000 },
    );
    return toItem(row);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw businessRule("ALREADY_CLOSED", "This day is already closed.");
    }
    throw error;
  }
}

export async function removeClosedDay(id: string): Promise<void> {
  const { count } = await getDb().closedDay.deleteMany({ where: { id } });
  if (count === 0) throw notFound("This closed day no longer exists.");
}
