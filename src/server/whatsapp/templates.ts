import type { Locale } from "@/i18n/config";
import { fmt, formatLongDateIn } from "@/i18n/format";
import { WHATSAPP_WORDING } from "@/i18n/whatsapp";
import { formatPhone } from "@/lib/phone";
import { toLocalTimeString } from "@/lib/time";
import type { WhatsAppButton, WhatsAppTemplate } from "./types";

/** Every WhatsApp text lives here. Dates and times are shown in the salon time zone (Africa/Casablanca). */

type Rendered = { template: WhatsAppTemplate; params: Record<string, string>; text: string; buttons?: WhatsAppButton[] };
/** serviceName is in the client's language for customer messages, in English for owner messages. */
type BookingInfo = { serviceName: string; startAt: Date };
type CustomerInfo = BookingInfo & { locale: Locale };
type OwnerInfo = BookingInfo & { customerName: string; customerPhone: string };

const when = (startAt: Date, locale: Locale = "en") => ({ date: formatLongDateIn(locale, startAt), time: toLocalTimeString(startAt) });

/** Button payloads parsed back by the webhook (see parseReplyPayload). */
export const confirmPayload = (bookingId: string) => `confirm:${bookingId}`;
export const cancelPayload = (bookingId: string) => `cancel:${bookingId}`;

export function parseReplyPayload(payload: string): { action: "confirm" | "cancel"; bookingId: string } | null {
  const match = /^(confirm|cancel):([a-z0-9]{10,40})$/i.exec(payload.trim());
  if (!match) return null;
  return { action: match[1].toLowerCase() === "confirm" ? "confirm" : "cancel", bookingId: match[2] };
}

export function bookingRequestCustomer({ serviceName, startAt, locale, bookingId, deadline }: CustomerInfo & { bookingId: string; deadline: Date }): Rendered {
  const { date, time } = when(startAt, locale);
  const until = toLocalTimeString(deadline);
  const params = { service: serviceName, date, time, deadline: until };
  const wording = WHATSAPP_WORDING[locale];
  return {
    template: "booking_request_customer",
    params,
    text: fmt(wording.request, params),
    buttons: [
      { payload: confirmPayload(bookingId), title: wording.confirmButton },
      { payload: cancelPayload(bookingId), title: wording.cancelButton },
    ],
  };
}

function customerNotice(template: WhatsAppTemplate, key: "confirmed" | "cancelled" | "expired", { serviceName, startAt, locale }: CustomerInfo): Rendered {
  const { date, time } = when(startAt, locale);
  const params = { service: serviceName, date, time };
  return { template, params, text: fmt(WHATSAPP_WORDING[locale][key], params) };
}

export const bookingConfirmedCustomer = (info: CustomerInfo) => customerNotice("booking_confirmed_customer", "confirmed", info);
export const bookingCancelledCustomer = (info: CustomerInfo) => customerNotice("booking_cancelled_customer", "cancelled", info);
export const bookingExpiredCustomer = (info: CustomerInfo) => customerNotice("booking_expired_customer", "expired", info);

function ownerParams({ serviceName, startAt, customerName, customerPhone }: OwnerInfo) {
  const { date, time } = when(startAt);
  return { name: customerName, phone: formatPhone(customerPhone), service: serviceName, date, time };
}

export function bookingNewOwner(info: OwnerInfo & { waiting: boolean }): Rendered {
  const p = ownerParams(info);
  return {
    template: "booking_new_owner",
    params: p,
    text: `New reservation${info.waiting ? " (waiting for client confirmation)" : ""}! Client: ${p.name} / Phone: ${p.phone} / Service: ${p.service} / Date: ${p.date} / Time: ${p.time}`,
  };
}

export function bookingConfirmedOwner(info: OwnerInfo): Rendered {
  const p = ownerParams(info);
  return {
    template: "booking_confirmed_owner",
    params: p,
    text: `Reservation confirmed by the client. Client: ${p.name} / Phone: ${p.phone} / Service: ${p.service} / Date: ${p.date} / Time: ${p.time}`,
  };
}

export function bookingCancelledOwner(info: OwnerInfo & { reason: "CUSTOMER" | "EXPIRED" }): Rendered {
  const p = ownerParams(info);
  const why = info.reason === "CUSTOMER" ? "cancelled by the client" : "not confirmed in time";
  return {
    template: "booking_cancelled_owner",
    params: p,
    text: `Reservation ${why}; the time is free again. Client: ${p.name} / Phone: ${p.phone} / Service: ${p.service} / Date: ${p.date} / Time: ${p.time}`,
  };
}
