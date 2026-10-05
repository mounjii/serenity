import { BUFFER_MINUTES, MAX_DAYS_AHEAD, MIN_LEAD_MINUTES, SLOT_STEP_MINUTES } from "@/lib/booking-rules";
import { addDays, addMinutes, isValidDateString, localToUtc, minutesToHHmm, toLocalDateString } from "@/lib/time";
import { getDb } from "@/server/db";
import { invalidInput, notFound } from "@/server/errors";
import { pickOption } from "@/lib/service-options";
import { getDaySchedule } from "./schedule";
import { holdsSlot } from "./slot-hold";

export type Slot = { time: string; startAt: string };

type AvailabilityOptions = {
  /** Admin bookings ignore the 2 h minimum notice and the 30-day horizon, but never past times. */
  ignoreLeadRules?: boolean;
  /** One of the service's durations; the shortest one when omitted. */
  durationMinutes?: number | null;
};

/** `?duration=` query value: absent means "shortest duration"; anything else must be a whole number of minutes. */
export function parseDurationParam(raw: string | null): number | null {
  if (raw === null || raw === "") return null;
  if (!/^\d{1,3}$/.test(raw)) throw invalidInput("duration must be a number of minutes.", { durationMinutes: "Invalid duration." });
  return Number(raw);
}

/**
 * Why a start time can or cannot be chosen:
 * "booked" = a session is in progress, "rest" = inside the pause after a session,
 * "unavailable" = free, but too short before the next booking for this duration.
 */
export type GridStatus = "available" | "booked" | "rest" | "unavailable";

export type GridTime = Slot & { available: boolean; status: GridStatus };

export async function getAvailability(
  serviceId: string,
  date: string,
  now = new Date(),
  options: AvailabilityOptions = {},
): Promise<Slot[]> {
  const grid = await getTimeGrid(serviceId, date, now, options);
  return grid.filter((t) => t.available).map(({ time, startAt }) => ({ time, startAt }));
}

/**
 * Every bookable start time of the day for this duration, booked or not.
 * Times that are past, too soon (2 h notice) or too far ahead are left out entirely.
 */
export async function getTimeGrid(
  serviceId: string,
  date: string,
  now = new Date(),
  options: AvailabilityOptions = {},
): Promise<GridTime[]> {
  if (!serviceId || serviceId.length > 40) throw invalidInput("A valid serviceId is required.");
  if (!isValidDateString(date)) throw invalidInput("date must be a valid YYYY-MM-DD date.");

  const db = getDb();
  const service = await db.service.findFirst({
    where: { id: serviceId, active: true },
    select: { options: { where: { active: true }, select: { durationMinutes: true, priceCents: true } } },
  });
  if (!service || service.options.length === 0) throw notFound("Service not found.");
  const option = pickOption(service.options, options.durationMinutes);
  if (!option) throw invalidInput("This duration is not available for this service.", { durationMinutes: "This duration is not available." });

  const today = toLocalDateString(now);
  if (date < today) return [];
  if (!options.ignoreLeadRules && date > addDays(today, MAX_DAYS_AHEAD)) return [];

  const schedule = await getDaySchedule(db, date);
  if (!schedule) return [];

  const therapists = await db.therapist.findMany({ where: { active: true }, select: { id: true } });
  if (therapists.length === 0) return [];
  const therapistIds = therapists.map((t) => t.id);

  const duration = option.durationMinutes;
  const earliest = options.ignoreLeadRules ? addMinutes(now, 1) : addMinutes(now, MIN_LEAD_MINUTES);
  const latest = options.ignoreLeadRules ? null : addMinutes(now, MAX_DAYS_AHEAD * 24 * 60);
  const windowStart = localToUtc(date, schedule.openMinute);
  const windowEnd = addMinutes(localToUtc(date, schedule.closeMinute), BUFFER_MINUTES);

  const bookings = await db.booking.findMany({
    where: {
      therapistId: { in: therapistIds },
      ...holdsSlot(now),
      startAt: { lt: windowEnd },
      blockedUntil: { gt: windowStart },
    },
    select: { therapistId: true, startAt: true, endAt: true, blockedUntil: true },
  });

  const grid: GridTime[] = [];
  for (let minute = schedule.openMinute; minute + duration <= schedule.closeMinute; minute += SLOT_STEP_MINUTES) {
    const start = localToUtc(date, minute);
    if (start < earliest || (latest && start > latest)) continue;
    const blockedUntil = addMinutes(start, duration + BUFFER_MINUTES);
    const hasFreeTherapist = therapistIds.some(
      (id) => !bookings.some((b) => b.therapistId === id && b.startAt < blockedUntil && b.blockedUntil > start),
    );
    let status: GridStatus = "available";
    if (!hasFreeTherapist) {
      if (bookings.some((b) => b.startAt <= start && b.endAt > start)) status = "booked";
      else if (bookings.some((b) => b.endAt <= start && b.blockedUntil > start)) status = "rest";
      else status = "unavailable";
    }
    grid.push({ time: minutesToHHmm(minute), startAt: start.toISOString(), available: hasFreeTherapist, status });
  }
  return grid;
}
