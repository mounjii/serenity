import { parsePhoneNumberFromString } from "libphonenumber-js";
import { DEFAULT_PHONE_COUNTRY } from "./booking-rules";

/** Returns the number in E.164 format, or null when it is not a valid phone number. */
export function normalizePhone(input: string): string | null {
  const parsed = parsePhoneNumberFromString(input.trim(), DEFAULT_PHONE_COUNTRY);
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number;
}

/** Human-friendly international format, e.g. "+212 6 12 34 56 78". */
export function formatPhone(e164: string): string {
  return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164;
}

/** wa.me expects digits only; `text` pre-fills the message, the user still presses send. */
export function whatsappLink(e164: string, text?: string): string {
  const base = `https://wa.me/${e164.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
