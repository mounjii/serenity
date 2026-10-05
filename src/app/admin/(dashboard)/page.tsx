import { connection } from "next/server";
import BookingDetailsProvider from "@/components/admin/BookingDetails";
import { LiveBookingList } from "@/components/admin/LiveBookings";
import NextBookingCard from "@/components/admin/NextBookingCard";
import UpcomingSection, { resolveRange } from "@/components/admin/UpcomingSection";
import { ButtonLink } from "@/components/ui/Button";
import { formatDayHeading } from "@/lib/time";
import { getDashboardSummary, listBookingsForDates, type AdminBooking } from "@/server/admin/bookings";
import { requireAdminPage } from "@/server/auth/session";
import { sweepExpiredBookings } from "@/server/booking/confirmation";
import { isMockWhatsApp } from "@/server/whatsapp";

function uniqueById(lists: (AdminBooking | null)[][]): AdminBooking[] {
  const map = new Map<string, AdminBooking>();
  for (const list of lists) for (const b of list) if (b) map.set(b.id, b);
  return [...map.values()];
}

export default async function AdminDashboardPage({ searchParams }: PageProps<"/admin">) {
  await connection();
  await requireAdminPage();
  await sweepExpiredBookings();
  const params = await searchParams;

  const summary = await getDashboardSummary();
  const range = resolveRange(params, summary.today);
  const [todayBookings, rangeBookings] = await Promise.all([
    listBookingsForDates(summary.today, summary.today),
    listBookingsForDates(range.from, range.to),
  ]);
  const next = summary.nextBooking;
  const confirmedToday = todayBookings.filter((b) => b.status === "CONFIRMED").length;
  const waiting = uniqueById([todayBookings, rangeBookings]).filter((b) => b.status === "PENDING").length;
  const plural = (n: number, word: string) => `${word}${n === 1 ? "" : "s"}`;

  return (
    <BookingDetailsProvider bookings={uniqueById([todayBookings, rangeBookings, [next]])} mockWhatsApp={isMockWhatsApp()}>
      <div className="space-y-14">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.68rem] tracking-[0.3em] text-muted uppercase">{formatDayHeading(summary.today, true)}</p>
            <h1 className="mt-3 font-serif text-[2.75rem] leading-none text-ink sm:text-5xl">Dashboard</h1>
            <p className="mt-3 text-[0.9rem] text-ink-soft">Here’s your schedule and booking activity for today.</p>
          </div>
          <ButtonLink href="/admin/bookings/new" size="sm" className="self-start px-5 sm:self-auto">
            + New booking
          </ButtonLink>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.5fr_1fr]" aria-label="Summary">
          <Stat label="Today" value={summary.todayCount} caption={plural(summary.todayCount, "Reservation")} />
          <NextBookingCard booking={next} isToday={next?.date === summary.today} />
          <Stat
            label="Confirmed"
            value={confirmedToday}
            caption={`${plural(confirmedToday, "Appointment")} today${waiting > 0 ? ` · ${waiting} waiting for WhatsApp` : ""}`}
          />
        </section>

        <section>
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-[1.9rem] leading-tight text-ink">Today’s schedule</h2>
            <span className="text-[0.8rem] text-muted">
              {summary.todayCount} {plural(summary.todayCount, "appointment")}
            </span>
          </div>
          <LiveBookingList bookings={todayBookings} emptyText="No reservations today. Enjoy a calm day." />
        </section>

        <UpcomingSection basePath="/admin" range={range} bookings={rangeBookings} today={summary.today} />
      </div>
    </BookingDetailsProvider>
  );
}

function Stat({ label, value, caption }: { label: string; value: number; caption: string }) {
  return (
    <div className="rounded-md border border-sand/70 bg-white px-6 py-5">
      <p className="text-[0.66rem] tracking-[0.26em] text-muted uppercase">{label}</p>
      <p className="mt-3 font-serif text-[2.75rem] leading-none text-ink lining-nums tabular-nums">{value}</p>
      <p className="mt-2 text-[0.8rem] text-ink-soft">{caption}</p>
    </div>
  );
}
