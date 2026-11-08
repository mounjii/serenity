import { connection } from "next/server";
import BookingDetailsProvider from "@/components/admin/BookingDetails";
import { ActivityList, Card } from "@/components/admin/DashboardWidgets";
import { formatDayHeading, toLocalDateString } from "@/lib/time";
import { listActivity, type ActivityEvent } from "@/server/admin/activity";
import { requireArea } from "@/server/auth/session";
import { sweepExpiredBookings } from "@/server/booking/confirmation";
import { getWhatsAppMode } from "@/server/whatsapp";

export const metadata = { title: "Activity — THAI PRAKHOP" };

const LIMIT = 100;

export default async function AdminActivityPage() {
  await connection();
  await requireArea("activity");
  await sweepExpiredBookings();
  const now = new Date();
  const events = await listActivity(LIMIT, now);
  const today = toLocalDateString(now);

  const days = new Map<string, ActivityEvent[]>();
  for (const e of events) {
    const day = toLocalDateString(new Date(e.at));
    days.set(day, [...(days.get(day) ?? []), e]);
  }
  const bookings = [...new Map(events.map((e) => [e.booking.id, e.booking])).values()];

  return (
    <BookingDetailsProvider bookings={bookings} whatsappMode={getWhatsAppMode()}>
      <div className="space-y-5 sm:space-y-6">
        <header>
          <h1 className="text-[1.7rem] leading-tight font-semibold tracking-[-0.03em] text-forest sm:text-[2rem]">Activity</h1>
          <p className="mt-1 text-[0.85rem] text-sage">{formatDayHeading(today, true)}. Everything that happened to your bookings, newest first.</p>
        </header>

        {events.length === 0 ? (
          <Card className="px-6 py-10 text-center text-[0.85rem] text-muted">No activity yet.</Card>
        ) : (
          [...days.entries()].map(([day, items]) => (
            <section key={day} aria-label={formatDayHeading(day)}>
              <h2 className="mb-3 px-1 text-[0.68rem] tracking-[0.26em] text-ink uppercase">
                {formatDayHeading(day)}
                {day === today && <span className="ml-2 text-muted">· Today</span>}
              </h2>
              <Card className="p-2 sm:p-3">
                <ActivityList events={items} />
              </Card>
            </section>
          ))
        )}
      </div>
    </BookingDetailsProvider>
  );
}
