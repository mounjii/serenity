import type { ErrorCode } from "@/server/errors";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";
import { fmt } from "./format";
import { CUSTOMER_NAME_MAX, CUSTOMER_NAME_MIN, NOTE_MAX } from "@/lib/booking-rules";

/** Server messages are written in English; other languages show the translation of the error code. */
export function errorMessage(t: Dictionary, locale: Locale, error: { code?: ErrorCode; message?: string } | null): string {
  if (locale === "en" && error?.message) return error.message;
  return (error?.code && t.errors.codes[error.code]) || t.errors.generic;
}

/** Translates a form field error (from the shared zod schema or the API) for the visitor. */
export function fieldErrorMessage(t: Dictionary, locale: Locale, field: string, message: string): string {
  if (locale === "en") return message;
  switch (field) {
    case "customerName":
      if (/at least/.test(message)) return fmt(t.fields.nameShort, { n: CUSTOMER_NAME_MIN });
      if (/at most/.test(message)) return fmt(t.fields.nameLong, { n: CUSTOMER_NAME_MAX });
      return t.fields.nameRequired;
    case "customerPhone":
      return t.fields.phoneInvalid;
    case "note":
      return fmt(t.fields.noteLong, { n: NOTE_MAX });
    default:
      return t.errors.codes.INVALID_INPUT ?? t.errors.generic;
  }
}
