import { formatPhone } from "@/lib/phone";
import { formatLongDate, toLocalTimeString } from "@/lib/time";
import type { WhatsAppButton, WhatsAppTemplate } from "./types";

/** Every WhatsApp text lives here. Dates and times are shown in the salon time zone (Africa/Casablanca). */

type Rendered = { template: WhatsAppTemplate; params: Record<string, string>; text: string; buttons?: WhatsAppButton[] };
type BookingInfo = { serviceName: string; startAt: Date };
type OwnerInfo = BookingInfo & { customerName: string; customerPhone: string };

const when = (startAt: Date) => ({ date: formatLongDate(startAt), time: toLocalTimeString(startAt) });

/** Button payloads parsed back by the webhook (see parseReplyPayload). */
export const confirmPayload = (bookingId: string) => `confirm:${bookingId}`;
export const cancelPayload = (bookingId: string) => `cancel:${bookingId}`;

export function parseReplyPayload(payload: string): { action: "confirm" | "cancel"; bookingId: string } | null {
  const match = /^(confirm|cancel):([a-z0-9]{10,40})$/i.exec(payload.trim());
  if (!match) return null;
  return { action: match[1].toLowerCase() === "confirm" ? "confirm" : "cancel", bookingId: match[2] };
}

export function bookingRequestCustomer({ serviceName, startAt, bookingId, deadline }: BookingInfo & { bookingId: string; deadline: Date }): Rendered {
  const { date, time } = when(startAt);
  const until = toLocalTimeString(deadline);
  return {
    template: "booking_request_customer",
    params: { service: serviceName, date, time, deadline: until },
    text: `Please confirm your reservation. Service: ${serviceName} / Date: ${date} / Time: ${time}. Tap "Confirm" before ${until}, otherwise the reservation is cancelled automatically.`,
    buttons: [
      { payload: confirmPayload(bookingId), title: "Confirm" },
      { payload: cancelPayload(bookingId), title: "Cancel" },
    ],
  };
}

export function bookingConfirmedCustomer({ serviceName, startAt }: BookingInfo): Rendered {
  const { date, time } = when(startAt);
  return {
    template: "booking_confirmed_customer",
    params: { service: serviceName, date, time },
    text: `Your reservation is confirmed. Service: ${serviceName} / Date: ${date} / Time: ${time}. Thank you for your reservation.`,
  };
}

export function bookingCancelledCustomer({ serviceName, startAt }: BookingInfo): Rendered {
  const { date, time } = when(startAt);
  return {
    template: "booking_cancelled_customer",
    params: { service: serviceName, date, time },
    text: `Your reservation for ${serviceName} on ${date} at ${time} has been cancelled.`,
  };
}

export function bookingExpiredCustomer({ serviceName, startAt }: BookingInfo): Rendered {
  const { date, time } = when(startAt);
  return {
    template: "booking_expired_customer",
    params: { service: serviceName, date, time },
    text: `Your reservation for ${serviceName} on ${date} at ${time} was not confirmed in time and has been cancelled. You are welcome to book again.`,
  };
}

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
