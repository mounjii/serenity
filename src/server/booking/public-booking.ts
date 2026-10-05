import type { BookingStatusValue } from "@/lib/booking-status";
import { formatLongDate, toLocalTimeString } from "@/lib/time";
import { getDb } from "@/server/db";

export type PublicBooking = {
  id: string;
  serviceName: string;
  startAt: string;
  endAt: string;
  date: string;
  time: string;
  priceCents: number;
  firstName: string;
  status: BookingStatusValue;
  /** Local HH:mm before which a waiting booking must be confirmed on WhatsApp. */
  confirmUntil: string | null;
};

/** Only what the confirmation page needs. Never the phone number or the note. */
export async function getPublicBooking(id: string): Promise<PublicBooking | null> {
  if (!/^[a-z0-9]{10,40}$/i.test(id)) return null;
  const row = await getDb().booking.findUnique({
    where: { id },
    select: {
      id: true,
      startAt: true,
      endAt: true,
      priceCents: true,
      customerName: true,
      status: true,
      confirmationExpiresAt: true,
      service: { select: { name: true } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    serviceName: row.service.name,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    date: formatLongDate(row.startAt),
    time: toLocalTimeString(row.startAt),
    priceCents: row.priceCents,
    firstName: row.customerName.split(" ")[0] ?? "",
    status: row.status,
    confirmUntil: row.status === "PENDING" && row.confirmationExpiresAt ? toLocalTimeString(row.confirmationExpiresAt) : null,
  };
}
