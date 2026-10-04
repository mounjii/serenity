import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { TIMEZONE } from "./booking-rules";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** True for a real calendar date written as YYYY-MM-DD. */
export function isValidDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Local (salon) calendar date of an instant, as YYYY-MM-DD. */
export function toLocalDateString(instant: Date): string {
  return formatInTimeZone(instant, TIMEZONE, "yyyy-MM-dd");
}

/** Local (salon) wall-clock time of an instant, as HH:mm. */
export function toLocalTimeString(instant: Date): string {
  return formatInTimeZone(instant, TIMEZONE, "HH:mm");
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
  return fromZonedTime(`${date}T${minutesToHHmm(minutes)}:00`, TIMEZONE);
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
  return formatInTimeZone(instant, TIMEZONE, "EEEE d MMMM yyyy");
}

/** e.g. "Mon 12 Oct" for a YYYY-MM-DD calendar date. */
export function formatShortDate(date: string): string {
  return formatInTimeZone(new Date(`${date}T12:00:00.000Z`), "UTC", "EEE d MMM");
}
