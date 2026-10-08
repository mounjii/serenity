import type { Locale } from "@/i18n/config";
import { CURRENCY } from "./booking-rules";

export function formatPrice(priceCents: number, locale: Locale = "en"): string {
  const amount = priceCents / 100;
  const text = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${text} ${locale === "ar" ? "درهم" : CURRENCY}`;
}

export function formatDuration(minutes: number, locale: Locale = "en"): string {
  return `${minutes} ${locale === "ar" ? "دقيقة" : "min"}`;
}
