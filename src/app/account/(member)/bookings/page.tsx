import BookingTabs from "@/components/account/BookingTabs";
import { getI18n } from "@/i18n/server";
import { getCustomerBookings } from "@/server/customer/bookings";
import { requireCustomerPage } from "@/server/customer/session";

export default async function BookingsPage() {
  const session = await requireCustomerPage();
  const { locale } = await getI18n();
  const bookings = await getCustomerBookings(session.phone, locale);

  return <BookingTabs bookings={bookings} />;
}
