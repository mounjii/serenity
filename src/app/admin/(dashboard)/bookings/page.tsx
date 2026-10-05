import { connection } from "next/server";
import BookingDetailsProvider from "@/components/admin/BookingDetails";
import UpcomingSection, { resolveRange } from "@/components/admin/UpcomingSection";
import { ButtonLink } from "@/components/ui/Button";
import { formatDayHeading, toLocalDateString } from "@/lib/time";
import { listBookingsForDates } from "@/server/admin/bookings";
import { requireAdminPage } from "@/server/auth/session";
import { sweepExpiredBookings } from "@/server/booking/confirmation";
import { getWhatsAppMode } from "@/server/whatsapp";

export const metadata = { title: "Bookings — Touch Sense" };

export default async function AdminBookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  await connection();
  await requireAdminPage();
  await sweepExpiredBookings();
  const params = await searchParams;
  const today = toLocalDateString(new Date());
  const range = resolveRange(params, today);
  const bookings = await listBookingsForDates(range.from, range.to);

  return (
    <BookingDetailsProvider bookings={bookings} whatsappMode={getWhatsAppMode()}>
      <div className="space-y-12">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.68rem] tracking-[0.3em] text-muted uppercase">{formatDayHeading(today, true)}</p>
            <h1 className="mt-3 font-serif text-[2.75rem] leading-none text-ink sm:text-5xl">Bookings</h1>
            <p className="mt-3 text-[0.9rem] text-ink-soft">Every reservation, grouped by day.</p>
          </div>
          <ButtonLink href="/admin/bookings/new" size="sm" className="self-start px-5 sm:self-auto">
            + New booking
          </ButtonLink>
        </header>

        <UpcomingSection basePath="/admin/bookings" range={range} bookings={bookings} today={today} heading="Schedule" />
      </div>
    </BookingDetailsProvider>
  );
}
