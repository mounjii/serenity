/**
 * Pre-written messages for wa.me click-to-chat links (manual WhatsApp mode): the sender's own WhatsApp
 * opens with the text filled in, so nothing is sent automatically and Meta charges nothing.
 * Written in the language the client booked in; serviceName and date must already be in that language.
 */

import type { Locale } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { WHATSAPP_WORDING, type WhatsAppWording } from "@/i18n/whatsapp";

type BookingText = { customerName: string; serviceName: string; date: string; time: string; bookingId: string; locale?: Locale };

/** Short reference the owner can match against the dashboard. */
export const bookingRef = (bookingId: string) => bookingId.slice(-6).toUpperCase();

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? "";

function render(key: keyof WhatsAppWording, b: BookingText): string {
  return fmt(WHATSAPP_WORDING[b.locale ?? "en"][key], {
    name: b.customerName,
    first: firstName(b.customerName),
    service: b.serviceName,
    date: b.date,
    time: b.time,
    ref: bookingRef(b.bookingId),
  });
}

export const customerConfirmText = (b: BookingText) => render("customerConfirm", b);
export const customerCancelText = (b: BookingText) => render("customerCancel", b);
export const ownerRequestText = (b: BookingText) => render("ownerRequest", b);
export const ownerConfirmedText = (b: BookingText) => render("ownerConfirmed", b);
export const ownerCancelledText = (b: BookingText) => render("ownerCancelled", b);
