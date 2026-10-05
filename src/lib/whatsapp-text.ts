/**
 * Pre-written messages for wa.me click-to-chat links (manual WhatsApp mode): the sender's own WhatsApp
 * opens with the text filled in, so nothing is sent automatically and Meta charges nothing.
 */

type BookingText = { customerName: string; serviceName: string; date: string; time: string; bookingId: string };

/** Short reference the owner can match against the dashboard. */
export const bookingRef = (bookingId: string) => bookingId.slice(-6).toUpperCase();

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? "";

export function customerConfirmText(b: BookingText): string {
  return `Hello Touch Sense, I confirm my reservation.\nName: ${b.customerName}\nService: ${b.serviceName}\nDate: ${b.date}\nTime: ${b.time}\nRef: ${bookingRef(b.bookingId)}`;
}

export function customerCancelText(b: BookingText): string {
  return `Hello Touch Sense, I would like to cancel my reservation.\nName: ${b.customerName}\nService: ${b.serviceName}\nDate: ${b.date}\nTime: ${b.time}\nRef: ${bookingRef(b.bookingId)}`;
}

export function ownerRequestText(b: BookingText): string {
  return `Hello ${firstName(b.customerName)}, this is Touch Sense. Please confirm your reservation: ${b.serviceName} on ${b.date} at ${b.time}. Reply YES to confirm or NO to cancel. Thank you!`;
}

export function ownerConfirmedText(b: BookingText): string {
  return `Hello ${firstName(b.customerName)}, your reservation at Touch Sense is confirmed: ${b.serviceName} on ${b.date} at ${b.time}. Payment is made at the salon. See you soon!`;
}

export function ownerCancelledText(b: BookingText): string {
  return `Hello ${firstName(b.customerName)}, your reservation at Touch Sense for ${b.serviceName} on ${b.date} at ${b.time} has been cancelled. You are welcome to book another time.`;
}
