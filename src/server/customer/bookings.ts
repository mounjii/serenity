import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatLongDateIn } from "@/i18n/format";
import { serviceText } from "@/i18n/services";
import type { BookingStatusValue } from "@/lib/booking-status";
import { toLocalTimeString } from "@/lib/time";
import { getDb } from "@/server/db";

export type CustomerBooking = {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  priceCents: number;
  status: BookingStatusValue;
  upcoming: boolean;
};

/** Bookings made with the same phone number as the signed-in customer. */
export async function getCustomerBookings(phone: string, locale: Locale): Promise<CustomerBooking[]> {
  const now = new Date();
  const rows = await getDb().booking.findMany({
    where: { customerPhone: phone },
    orderBy: { startAt: "desc" },
    take: 30,
    select: {
      id: true,
      startAt: true,
      priceCents: true,
      status: true,
      service: { select: { name: true, slug: true, description: true } },
    },
  });

  const t = getDictionary(locale);
  return rows.map((row) => ({
    id: row.id,
    serviceName: serviceText(t, row.service).name,
    date: formatLongDateIn(locale, row.startAt),
    time: toLocalTimeString(row.startAt),
    priceCents: row.priceCents,
    status: row.status,
    upcoming: row.startAt.getTime() >= now.getTime() && (row.status === "PENDING" || row.status === "CONFIRMED"),
  }));
}
