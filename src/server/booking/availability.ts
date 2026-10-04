import { BUFFER_MINUTES, MAX_DAYS_AHEAD, MIN_LEAD_MINUTES, SLOT_STEP_MINUTES } from "@/lib/booking-rules";
import { addDays, addMinutes, isValidDateString, localToUtc, minutesToHHmm, toLocalDateString } from "@/lib/time";
import { getDb } from "@/server/db";
import { invalidInput, notFound } from "@/server/errors";
import { getDaySchedule } from "./schedule";

export type Slot = { time: string; startAt: string };

export async function getAvailability(serviceId: string, date: string, now = new Date()): Promise<Slot[]> {
  if (!serviceId || serviceId.length > 40) throw invalidInput("A valid serviceId is required.");
  if (!isValidDateString(date)) throw invalidInput("date must be a valid YYYY-MM-DD date.");

  const db = getDb();
  const service = await db.service.findFirst({
    where: { id: serviceId, active: true },
    select: { durationMinutes: true },
  });
  if (!service) throw notFound("Service not found.");

  const today = toLocalDateString(now);
  if (date < today || date > addDays(today, MAX_DAYS_AHEAD)) return [];

  const schedule = await getDaySchedule(db, date);
  if (!schedule) return [];

  const therapists = await db.therapist.findMany({ where: { active: true }, select: { id: true } });
  if (therapists.length === 0) return [];
  const therapistIds = therapists.map((t) => t.id);

  const duration = service.durationMinutes;
  const earliest = addMinutes(now, MIN_LEAD_MINUTES);
  const latest = addMinutes(now, MAX_DAYS_AHEAD * 24 * 60);
  const windowStart = localToUtc(date, schedule.openMinute);
  const windowEnd = addMinutes(localToUtc(date, schedule.closeMinute), BUFFER_MINUTES);

  const bookings = await db.booking.findMany({
    where: {
      therapistId: { in: therapistIds },
      status: { not: "CANCELLED" },
      startAt: { lt: windowEnd },
      blockedUntil: { gt: windowStart },
    },
    select: { therapistId: true, startAt: true, blockedUntil: true },
  });

  const slots: Slot[] = [];
  for (let minute = schedule.openMinute; minute + duration <= schedule.closeMinute; minute += SLOT_STEP_MINUTES) {
    const start = localToUtc(date, minute);
    if (start < earliest || start > latest) continue;
    const blockedUntil = addMinutes(start, duration + BUFFER_MINUTES);
    const hasFreeTherapist = therapistIds.some(
      (id) => !bookings.some((b) => b.therapistId === id && b.startAt < blockedUntil && b.blockedUntil > start),
    );
    if (hasFreeTherapist) slots.push({ time: minutesToHHmm(minute), startAt: start.toISOString() });
  }
  return slots;
}
