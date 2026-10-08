import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatLongDateIn } from "@/i18n/format";
import { serviceText } from "@/i18n/services";
import type { BookingStatusValue } from "@/lib/booking-status";
import { toLocalTimeString } from "@/lib/time";
import { getDb } from "@/server/db";

export type PublicBooking = {
  id: string;
  /** In the language of the page. */
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
export async function getPublicBooking(id: string, locale: Locale = "en"): Promise<PublicBooking | null> {
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
      service: { select: { name: true, slug: true, description: true } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    serviceName: serviceText(getDictionary(locale), row.service).name,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    date: formatLongDateIn(locale, row.startAt),
    time: toLocalTimeString(row.startAt),
    priceCents: row.priceCents,
    firstName: row.customerName.split(" ")[0] ?? "",
    status: row.status,
    confirmUntil: row.status === "PENDING" && row.confirmationExpiresAt ? toLocalTimeString(row.confirmationExpiresAt) : null,
  };
}
