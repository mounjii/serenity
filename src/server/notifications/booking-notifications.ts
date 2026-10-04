import { after } from "next/server";
import { normalizePhone } from "@/lib/phone";
import { getDb } from "@/server/db";
import { getWhatsAppProvider, type WhatsAppMessage } from "@/server/whatsapp";
import { logNotification } from "@/server/whatsapp/log";
import { bookingCancelledCustomer, bookingConfirmedCustomer, bookingNewOwner } from "@/server/whatsapp/templates";

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).slice(0, 2000);

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

async function loadBooking(bookingId: string) {
  return getDb().booking.findUnique({
    where: { id: bookingId },
    select: { id: true, startAt: true, customerName: true, customerPhone: true, service: { select: { name: true } } },
  });
}

/** New reservation (online or admin): confirmation to the customer and an alert to the owner. */
export async function notifyBookingCreated(bookingId: string): Promise<void> {
  const booking = await loadBooking(bookingId);
  if (!booking) return;
  const info = { serviceName: booking.service.name, startAt: booking.startAt };

  await deliver({ bookingId, recipient: "CUSTOMER", to: booking.customerPhone, ...bookingConfirmedCustomer(info) });

  const ownerMessage = bookingNewOwner({ ...info, customerName: booking.customerName, customerPhone: booking.customerPhone });
  const ownerPhone = normalizePhone(process.env.OWNER_WHATSAPP_PHONE ?? "");
  if (!ownerPhone) {
    const message: WhatsAppMessage = { bookingId, recipient: "OWNER", to: process.env.OWNER_WHATSAPP_PHONE?.trim() ?? "", ...ownerMessage };
    console.error("[whatsapp] OWNER_WHATSAPP_PHONE is missing or invalid; owner alert not sent.");
    await logNotification({ message, provider: "none", status: "FAILED", error: "OWNER_WHATSAPP_PHONE is missing or is not a valid phone number." }).catch(
      (error: unknown) => console.error("[whatsapp] could not record the failed notification", error),
    );
    return;
  }
  await deliver({ bookingId, recipient: "OWNER", to: ownerPhone, ...ownerMessage });
}

/** Reservation cancelled by the admin: tell the customer. */
export async function notifyBookingCancelled(bookingId: string): Promise<void> {
  const booking = await loadBooking(bookingId);
  if (!booking) return;
  await deliver({
    bookingId,
    recipient: "CUSTOMER",
    to: booking.customerPhone,
    ...bookingCancelledCustomer({ serviceName: booking.service.name, startAt: booking.startAt }),
  });
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

export function scheduleBookingCancelledNotification(bookingId: string): void {
  after(safely(() => notifyBookingCancelled(bookingId)));
}
