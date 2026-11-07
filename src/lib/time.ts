import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { TIMEZONE } from "./booking-rules";

/**
 * Morocco returned to permanent GMT at 02:00 (UTC+1) on 20 September 2026,
 * which is this instant. Some Node builds still have Africa/Casablanca at
 * UTC+1, so salon wall-clock math uses UTC from here on.
 */
const MOROCCO_GMT_START = Date.parse("2026-09-20T01:00:00.000Z");

/** Time zone name that formats this instant as current Moroccan wall time. */
export function salonZone(instant: Date): string {
  return instant.getTime() >= MOROCCO_GMT_START ? "UTC" : TIMEZONE;
}

function zoneForWallClock(date: string, minutes: number): string {
  if (date > "2026-09-20") return "UTC";
  if (date < "2026-09-20") return TIMEZONE;
  return minutes >= 60 ? "UTC" : TIMEZONE;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** True for a real calendar date written as YYYY-MM-DD. */
export function isValidDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Local (salon) calendar date of an instant, as YYYY-MM-DD. */
export function toLocalDateString(instant: Date): string {
  return formatInTimeZone(instant, salonZone(instant), "yyyy-MM-dd");
}

/** Local (salon) wall-clock time of an instant, as HH:mm. */
export function toLocalTimeString(instant: Date): string {
  return formatInTimeZone(instant, salonZone(instant), "HH:mm");
}

/** Minutes since local midnight for an instant. */
export function toLocalMinuteOfDay(instant: Date): number {
  const [h, m] = toLocalTimeString(instant).split(":").map(Number);
  return h * 60 + m;
}

export function minutesToHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** UTC instant for a local date + minutes since local midnight. */
export function localToUtc(date: string, minutes: number): Date {
  const clock = `${date}T${minutesToHHmm(minutes)}:00`;
  if (zoneForWallClock(date, minutes) === "UTC") return new Date(`${clock}.000Z`);
  return fromZonedTime(clock, TIMEZONE);
}

/** 0 = Sunday ... 6 = Saturday, for a calendar date (independent of time zones). */
export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00.000Z`).getUTCDay();
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Value to store in / compare with a MySQL DATE column. */
export function dateStringToDbDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export function dbDateToDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function addMinutes(instant: Date, minutes: number): Date {
  return new Date(instant.getTime() + minutes * 60_000);
}

/** e.g. "Monday 12 October 2026" in the salon time zone. */
export function formatLongDate(instant: Date): string {
  return formatInTimeZone(instant, salonZone(instant), "EEEE d MMMM yyyy");
}

/** e.g. "Monday · 12 October" (or with the year) for a YYYY-MM-DD calendar date. */
export function formatDayHeading(date: string, withYear = false): string {
  return formatInTimeZone(new Date(`${date}T12:00:00.000Z`), "UTC", withYear ? "EEEE · d MMMM yyyy" : "EEEE · d MMMM");
}

/** e.g. "Mon 12 Oct" for a YYYY-MM-DD calendar date. */
export function formatShortDate(date: string): string {
  return formatInTimeZone(new Date(`${date}T12:00:00.000Z`), "UTC", "EEE d MMM");
}
