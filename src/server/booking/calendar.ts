import { MAX_DAYS_AHEAD } from "@/lib/booking-rules";
import { addDays, dateStringToDbDate, dbDateToDateString, toLocalDateString, weekdayOf } from "@/lib/time";
import { getDb } from "@/server/db";

export type BookableDay = { date: string; open: boolean };

/** Today and the next MAX_DAYS_AHEAD days (salon time zone), with closed days flagged. */
export async function getBookableDays(now = new Date()): Promise<BookableDay[]> {
  const db = getDb();
  const today = toLocalDateString(now);
  const last = addDays(today, MAX_DAYS_AHEAD);

  const [hours, closedDays] = await Promise.all([
    db.openingHours.findMany(),
    db.closedDay.findMany({
      where: { date: { gte: dateStringToDbDate(today), lte: dateStringToDbDate(last) } },
      select: { date: true },
    }),
  ]);
  const openWeekdays = new Set(hours.filter((h) => !h.closed && h.closeMinute > h.openMinute).map((h) => h.weekday));
  const closed = new Set(closedDays.map((d) => dbDateToDateString(d.date)));

  return Array.from({ length: MAX_DAYS_AHEAD + 1 }, (_, i) => {
    const date = addDays(today, i);
    return { date, open: openWeekdays.has(weekdayOf(date)) && !closed.has(date) };
  });
}
