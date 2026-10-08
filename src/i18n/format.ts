import { formatInTimeZone } from "date-fns-tz";
import { TIMEZONE } from "@/lib/booking-rules";
import { INTL_LOCALE, type Locale } from "./config";

/** Fills "{name}" placeholders. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

function intlDate(locale: Locale, instant: Date, timeZone: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { ...options, timeZone, numberingSystem: "latn" }).format(instant);
}

/** e.g. "Monday 12 October 2026" / "lundi 12 octobre 2026" / "الاثنين 12 أكتوبر 2026", in the salon time zone. */
export function formatLongDateIn(locale: Locale, instant: Date): string {
  if (locale === "en") return formatInTimeZone(instant, TIMEZONE, "EEEE d MMMM yyyy");
  return intlDate(locale, instant, TIMEZONE, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/** Weekday, day and month names of a YYYY-MM-DD calendar date. */
export function dayPartsIn(locale: Locale, date: string): { weekday: string; shortWeekday: string; day: string; month: string; longMonth: string } {
  const instant = new Date(`${date}T12:00:00.000Z`);
  const part = (options: Intl.DateTimeFormatOptions) => intlDate(locale, instant, "UTC", options);
  return {
    weekday: part({ weekday: "long" }),
    shortWeekday: part({ weekday: "short" }),
    day: part({ day: "numeric" }),
    month: part({ month: "short" }),
    longMonth: part({ month: "long" }),
  };
}

/** e.g. "Monday 12 October" for a YYYY-MM-DD calendar date. */
export function formatDayIn(locale: Locale, date: string, withYear = false): string {
  if (locale === "en") return formatInTimeZone(new Date(`${date}T12:00:00.000Z`), "UTC", withYear ? "EEEE d MMMM yyyy" : "EEEE d MMMM");
  return intlDate(locale, new Date(`${date}T12:00:00.000Z`), "UTC", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
  });
}
