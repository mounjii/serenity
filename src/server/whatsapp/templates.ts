import { formatPhone } from "@/lib/phone";
import { formatLongDate, toLocalTimeString } from "@/lib/time";
import type { WhatsAppTemplate } from "./types";

/** Every WhatsApp text lives here. Dates and times are shown in the salon time zone (Africa/Casablanca). */

type Rendered = { template: WhatsAppTemplate; params: Record<string, string>; text: string };
type BookingInfo = { serviceName: string; startAt: Date };

const when = (startAt: Date) => ({ date: formatLongDate(startAt), time: toLocalTimeString(startAt) });

export function bookingConfirmedCustomer({ serviceName, startAt }: BookingInfo): Rendered {
  const { date, time } = when(startAt);
  return {
    template: "booking_confirmed_customer",
    params: { service: serviceName, date, time },
    text: `Your reservation is confirmed. Service: ${serviceName} / Date: ${date} / Time: ${time}. Thank you for your reservation.`,
  };
}

export function bookingNewOwner({ serviceName, startAt, customerName, customerPhone }: BookingInfo & { customerName: string; customerPhone: string }): Rendered {
  const { date, time } = when(startAt);
  const phone = formatPhone(customerPhone);
  return {
    template: "booking_new_owner",
    params: { name: customerName, phone, service: serviceName, date, time },
    text: `New reservation! Client: ${customerName} / Phone: ${phone} / Service: ${serviceName} / Date: ${date} / Time: ${time}`,
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
