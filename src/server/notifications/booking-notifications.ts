import { after } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { serviceText } from "@/i18n/services";
import { normalizePhone } from "@/lib/phone";
import { getDb } from "@/server/db";
import { getWhatsAppProvider, type WhatsAppMessage } from "@/server/whatsapp";
import { logNotification } from "@/server/whatsapp/log";
import {
  bookingCancelledCustomer,
  bookingCancelledOwner,
  bookingConfirmedCustomer,
  bookingConfirmedOwner,
  bookingExpiredCustomer,
  bookingNewOwner,
  bookingRequestCustomer,
} from "@/server/whatsapp/templates";

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).slice(0, 2000);

type Rendered = Pick<WhatsAppMessage, "template" | "params" | "text" | "buttons">;

/** Never throws: a failed message is recorded as FAILED and the reservation is left untouched. */
async function deliver(message: WhatsAppMessage): Promise<void> {
  let providerName = process.env.WHATSAPP_PROVIDER?.trim() || "unset";
  try {
    const provider = getWhatsAppProvider();
    providerName = provider.name;
    await provider.send(message);
  } catch (error) {
    console.error(`[whatsapp] ${message.template} to ${message.recipient.toLowerCase()} failed:`, errorText(error));
    try {
      await logNotification({ message, provider: providerName, status: "FAILED", error: errorText(error) });
    } catch (logError) {
      console.error("[whatsapp] could not record the failed notification:", errorText(logError).split("\n")[0]);
    }
  }
}

async function deliverToOwner(bookingId: string, rendered: Rendered): Promise<void> {
  const ownerPhone = normalizePhone(process.env.OWNER_WHATSAPP_PHONE ?? "");
  if (!ownerPhone) {
    const message: WhatsAppMessage = { bookingId, recipient: "OWNER", to: process.env.OWNER_WHATSAPP_PHONE?.trim() ?? "", ...rendered };
    console.error("[whatsapp] OWNER_WHATSAPP_PHONE is missing or invalid; owner alert not sent.");
    await logNotification({ message, provider: "none", status: "FAILED", error: "OWNER_WHATSAPP_PHONE is missing or is not a valid phone number." }).catch(
      (error: unknown) => console.error("[whatsapp] could not record the failed notification", error),
    );
    return;
  }
  await deliver({ bookingId, recipient: "OWNER", to: ownerPhone, ...rendered });
}

async function loadBooking(bookingId: string) {
  const booking = await getDb().booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status: true,
      startAt: true,
      confirmationExpiresAt: true,
      customerName: true,
      customerPhone: true,
      locale: true,
      service: { select: { name: true, slug: true, description: true } },
    },
  });
  if (!booking) return null;
  const locale = isLocale(booking.locale) ? booking.locale : DEFAULT_LOCALE;
  const info = { serviceName: serviceText(getDictionary(locale), booking.service).name, startAt: booking.startAt, locale };
  const owner = { serviceName: booking.service.name, startAt: booking.startAt, customerName: booking.customerName, customerPhone: booking.customerPhone };
  return { booking, info, owner };
}

/**
 * New reservation. Online bookings are waiting: the customer gets Confirm/Cancel buttons and the owner
 * an alert saying it is not confirmed yet. Admin bookings are already confirmed.
 */
export async function notifyBookingCreated(bookingId: string): Promise<void> {
  const loaded = await loadBooking(bookingId);
  if (!loaded) return;
  const { booking, info, owner } = loaded;
  const waiting = booking.status === "PENDING";

  const customerMessage =
    waiting && booking.confirmationExpiresAt
      ? bookingRequestCustomer({ ...info, bookingId, deadline: booking.confirmationExpiresAt })
      : bookingConfirmedCustomer(info);
  await deliver({ bookingId, recipient: "CUSTOMER", to: booking.customerPhone, ...customerMessage });
  await deliverToOwner(bookingId, bookingNewOwner({ ...owner, waiting }));
}

/** Customer (or admin) confirmed a waiting reservation. */
export async function notifyBookingConfirmed(bookingId: string, by: "CUSTOMER" | "ADMIN"): Promise<void> {
  const loaded = await loadBooking(bookingId);
  if (!loaded) return;
  await deliver({ bookingId, recipient: "CUSTOMER", to: loaded.booking.customerPhone, ...bookingConfirmedCustomer(loaded.info) });
  if (by === "CUSTOMER") await deliverToOwner(bookingId, bookingConfirmedOwner(loaded.owner));
}

/** Reservation cancelled by the admin: tell the customer. */
export async function notifyBookingCancelled(bookingId: string): Promise<void> {
  const loaded = await loadBooking(bookingId);
  if (!loaded) return;
  await deliver({ bookingId, recipient: "CUSTOMER", to: loaded.booking.customerPhone, ...bookingCancelledCustomer(loaded.info) });
}

/** Customer tapped Cancel, or never confirmed: tell both sides that the time is free again. */
export async function notifyBookingReleased(bookingId: string, reason: "CUSTOMER" | "EXPIRED"): Promise<void> {
  const loaded = await loadBooking(bookingId);
  if (!loaded) return;
  const customerMessage = reason === "EXPIRED" ? bookingExpiredCustomer(loaded.info) : bookingCancelledCustomer(loaded.info);
  await deliver({ bookingId, recipient: "CUSTOMER", to: loaded.booking.customerPhone, ...customerMessage });
  await deliverToOwner(bookingId, bookingCancelledOwner({ ...loaded.owner, reason }));
}

const safely = (task: () => Promise<void>) => async () => {
  try {
    await task();
  } catch (error) {
    console.error("[whatsapp] notification task failed", error);
  }
};

/** Runs after the response has been sent, so WhatsApp never slows down or breaks a reservation. */
export function scheduleBookingCreatedNotifications(bookingId: string): void {
  after(safely(() => notifyBookingCreated(bookingId)));
}

export function scheduleBookingConfirmedNotification(bookingId: string, by: "CUSTOMER" | "ADMIN"): void {
  after(safely(() => notifyBookingConfirmed(bookingId, by)));
}

export function scheduleBookingCancelledNotification(bookingId: string): void {
  after(safely(() => notifyBookingCancelled(bookingId)));
}

export function scheduleBookingReleasedNotification(bookingId: string, reason: "CUSTOMER" | "EXPIRED"): void {
  after(safely(() => notifyBookingReleased(bookingId, reason)));
}
