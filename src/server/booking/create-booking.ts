import { randomBytes } from "node:crypto";
import { Prisma, type BookingSource } from "@/generated/prisma/client";
import { BUFFER_MINUTES, MAX_DAYS_AHEAD, MIN_LEAD_MINUTES, SLOT_STEP_MINUTES } from "@/lib/booking-rules";
import { createBookingSchema } from "@/lib/booking-schema";
import { pickOption } from "@/lib/service-options";
import { addMinutes, dateStringToDbDate, localToUtc, toLocalDateString, toLocalMinuteOfDay } from "@/lib/time";
import { getDb } from "@/server/db";
import { AppError, businessRule } from "@/server/errors";
import { getWhatsAppMode } from "@/server/whatsapp";
import { getDaySchedule } from "./schedule";
import { confirmationDeadline, holdsSlot } from "./slot-hold";

export type BookingSummary = {
  id: string;
  serviceName: string;
  startAt: Date;
  endAt: Date;
  priceCents: number;
};

export type CreateBookingResult =
  | { kind: "created"; booking: BookingSummary }
  | { kind: "existing"; booking: BookingSummary }
  | { kind: "ignored"; booking: BookingSummary };

type CreateBookingOptions = { source: BookingSource; now?: Date };

const MAX_ATTEMPTS = 3;
const SLOT_TAKEN_MESSAGE = "This time was just booked by someone else. Please choose another time.";

const summarySelect = {
  id: true,
  startAt: true,
  endAt: true,
  priceCents: true,
  service: { select: { name: true } },
} satisfies Prisma.BookingSelect;

type SummaryRow = Prisma.BookingGetPayload<{ select: typeof summarySelect }>;

function toSummary(row: SummaryRow): BookingSummary {
  return { id: row.id, serviceName: row.service.name, startAt: row.startAt, endAt: row.endAt, priceCents: row.priceCents };
}

/**
 * The only place in the codebase that inserts into Booking (online and admin bookings).
 *
 * Double-booking protection: inside a READ COMMITTED transaction the active therapist rows are locked
 * with SELECT ... FOR UPDATE (always in id order, so concurrent transactions cannot deadlock each other).
 * A concurrent request therefore waits until the first one commits, then re-reads the bookings and sees
 * the new row, so two overlapping non-cancelled bookings for the same therapist can never both commit.
 */
export async function createBooking(rawInput: unknown, options: CreateBookingOptions): Promise<CreateBookingResult> {
  const now = options.now ?? new Date();
  const input = createBookingSchema.parse(rawInput);

  if (input.website && input.website.trim() !== "") {
    console.warn("[booking] honeypot field filled, request ignored");
    const start = new Date(input.startAt);
    return {
      kind: "ignored",
      booking: { id: `c${randomBytes(12).toString("hex")}`, serviceName: "", startAt: start, endAt: start, priceCents: 0 },
    };
  }

  const db = getDb();

  if (input.idempotencyKey) {
    const existing = await db.booking.findUnique({ where: { idempotencyKey: input.idempotencyKey }, select: summarySelect });
    if (existing) return { kind: "existing", booking: toSummary(existing) };
  }

  const startAt = new Date(input.startAt);
  if (startAt.getUTCSeconds() !== 0 || startAt.getUTCMilliseconds() !== 0) {
    throw businessRule("INVALID_SLOT", "This start time is not a valid booking slot.");
  }

  const serviceRow = await db.service.findFirst({
    where: { id: input.serviceId, active: true },
    select: { id: true, options: { where: { active: true }, select: { durationMinutes: true, priceCents: true } } },
  });
  if (!serviceRow) throw businessRule("SERVICE_UNAVAILABLE", "This service is not available.");
  // Duration and price always come from the database, never from the client.
  const option = pickOption(serviceRow.options, input.durationMinutes);
  if (!option) throw businessRule("SERVICE_UNAVAILABLE", "This duration is not available for this service.");
  const service = { id: serviceRow.id, durationMinutes: option.durationMinutes, priceCents: option.priceCents };

  const localDate = toLocalDateString(startAt);
  const schedule = await getDaySchedule(db, localDate);
  if (!schedule) throw businessRule("CLOSED", "The salon is closed on this day.");

  const minute = toLocalMinuteOfDay(startAt);
  if (minute < schedule.openMinute || minute + service.durationMinutes > schedule.closeMinute) {
    throw businessRule("OUTSIDE_OPENING_HOURS", "This time is outside our opening hours.");
  }
  if ((minute - schedule.openMinute) % SLOT_STEP_MINUTES !== 0 || localToUtc(localDate, minute).getTime() !== startAt.getTime()) {
    throw businessRule("INVALID_SLOT", "This start time is not a valid booking slot.");
  }

  if (options.source === "ADMIN" && startAt <= now) {
    throw businessRule("TOO_SOON", "This time has already passed.");
  }
  if (options.source === "ONLINE") {
    if (startAt < addMinutes(now, MIN_LEAD_MINUTES)) {
      throw businessRule("TOO_SOON", `Reservations must be made at least ${MIN_LEAD_MINUTES / 60} hours in advance.`);
    }
    if (startAt > addMinutes(now, MAX_DAYS_AHEAD * 24 * 60)) {
      throw businessRule("TOO_FAR", `Reservations can be made up to ${MAX_DAYS_AHEAD} days in advance.`);
    }
  }

  const endAt = addMinutes(startAt, service.durationMinutes);
  const blockedUntil = addMinutes(endAt, BUFFER_MINUTES);

  for (let attempt = 1; ; attempt++) {
    try {
      const row = await db.$transaction(
        async (tx) => {
          // Fail fast instead of waiting InnoDB's default 50 s if the lock is held for some reason.
          await tx.$executeRaw`SET SESSION innodb_lock_wait_timeout = 8`;
          const locked = await tx.$queryRaw<{ id: string }[]>`
            SELECT id FROM therapists WHERE active = 1 ORDER BY id FOR UPDATE`;
          if (locked.length === 0) throw businessRule("NO_THERAPIST", "No therapist is available.");

          // Closing a day takes the same lock, so this re-check cannot race with it.
          const closedDay = await tx.closedDay.findUnique({ where: { date: dateStringToDbDate(localDate) }, select: { id: true } });
          if (closedDay) throw businessRule("CLOSED", "The salon is closed on this day.");

          const overlapping = await tx.booking.findMany({
            where: {
              therapistId: { in: locked.map((t) => t.id) },
              ...holdsSlot(now),
              startAt: { lt: blockedUntil },
              blockedUntil: { gt: startAt },
            },
            select: { therapistId: true },
          });
          const busy = new Set(overlapping.map((b) => b.therapistId));
          const therapistId = locked.find((t) => !busy.has(t.id))?.id;
          if (!therapistId) throw new AppError(409, "SLOT_TAKEN", SLOT_TAKEN_MESSAGE);

          return tx.booking.create({
            data: {
              serviceId: service.id,
              therapistId,
              startAt,
              endAt,
              blockedUntil,
              durationMinutes: service.durationMinutes,
              priceCents: service.priceCents,
              customerName: input.customerName,
              customerPhone: input.customerPhone,
              note: input.note ?? null,
              locale: input.locale ?? "en",
              // Online bookings wait for the customer's WhatsApp confirmation; the admin books on the customer's behalf.
              // In manual mode the admin confirms by hand, so there is no deadline (null keeps the slot held).
              ...(options.source === "ONLINE"
                ? {
                    status: "PENDING" as const,
                    confirmationExpiresAt: getWhatsAppMode() === "manual" ? null : confirmationDeadline(now, startAt),
                  }
                : { status: "CONFIRMED" as const, confirmedAt: now }),
              source: options.source,
              idempotencyKey: input.idempotencyKey ?? null,
            },
            select: summarySelect,
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, maxWait: 5_000, timeout: 15_000 },
      );
      return { kind: "created", booking: toSummary(row) };
    } catch (error) {
      if (error instanceof AppError) throw error;

      if (input.idempotencyKey && isUniqueViolation(error)) {
        const existing = await db.booking.findUnique({ where: { idempotencyKey: input.idempotencyKey }, select: summarySelect });
        if (existing) return { kind: "existing", booking: toSummary(existing) };
      }

      if (isRetryableTransactionError(error)) {
        if (attempt < MAX_ATTEMPTS) continue;
        console.error("[booking] transaction kept failing after retries", error);
        throw new AppError(503, "SERVER_BUSY", "We are receiving many requests right now. Please try again in a moment.");
      }
      throw error;
    }
  }
}

function errorText(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return `${error.code} ${error.message} ${JSON.stringify(error.meta ?? {})}`;
  }
  return error instanceof Error ? error.message : String(error);
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/** Deadlocks, lock-wait timeouts and Prisma transaction timeouts: the transaction was rolled back, so retrying is safe. */
function isRetryableTransactionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2034" || error.code === "P2028")) {
    return true;
  }
  return /deadlock|lock wait timeout|\b1205\b|\b1213\b|transaction already closed|expired transaction/i.test(errorText(error));
}
