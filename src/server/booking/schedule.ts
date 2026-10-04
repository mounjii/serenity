import type { PrismaClient } from "@/generated/prisma/client";
import { dateStringToDbDate, weekdayOf } from "@/lib/time";

type Reader = Pick<PrismaClient, "openingHours" | "closedDay">;

export type DaySchedule = { openMinute: number; closeMinute: number };

/** Opening window for a local date, or null when the salon is closed that day. */
export async function getDaySchedule(db: Reader, date: string): Promise<DaySchedule | null> {
  const [hours, closedDay] = await Promise.all([
    db.openingHours.findUnique({ where: { weekday: weekdayOf(date) } }),
    db.closedDay.findUnique({ where: { date: dateStringToDbDate(date) }, select: { id: true } }),
  ]);
  if (!hours || hours.closed || closedDay) return null;
  if (hours.closeMinute <= hours.openMinute) return null;
  return { openMinute: hours.openMinute, closeMinute: hours.closeMinute };
}
