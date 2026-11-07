import Link from "next/link";
import { connection } from "next/server";
import UpcomingSection, { resolveRange } from "@/components/admin/UpcomingSection";
import { ButtonLink } from "@/components/ui/Button";
import type { BookingStatusValue } from "@/lib/booking-status";
import { formatDayHeading, toLocalDateString } from "@/lib/time";
import { listBookingsForDates } from "@/server/admin/bookings";
import { requireArea } from "@/server/auth/session";
import { sweepExpiredBookings } from "@/server/booking/confirmation";

export const metadata = { title: "Bookings — Touch Sense" };

const STATUS_FILTERS = [
  { key: "all", label: "All", statuses: null },
  { key: "confirmed", label: "Confirmed", statuses: ["CONFIRMED", "COMPLETED"] },
  { key: "waiting", label: "Waiting", statuses: ["PENDING"] },
  { key: "cancelled", label: "Cancelled", statuses: ["CANCELLED"] },
] as const satisfies readonly { key: string; label: string; statuses: readonly BookingStatusValue[] | null }[];

export default async function AdminBookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  await connection();
  await requireArea("bookings");
  await sweepExpiredBookings();
  const params = await searchParams;
  const today = toLocalDateString(new Date());
  const range = resolveRange(params, today);
  const filter = STATUS_FILTERS.find((f) => f.key === params.status) ?? STATUS_FILTERS[0];
  const all = await listBookingsForDates(range.from, range.to);
  const allowed: readonly BookingStatusValue[] | null = filter.statuses;
  const bookings = allowed ? all.filter((b) => allowed.includes(b.status)) : all;

  const rangeQuery = `view=${range.view}${range.view === "date" && range.date ? `&date=${range.date}` : ""}`;
  const statusQuery = filter.key === "all" ? "" : `&status=${filter.key}`;
  const countFor = (statuses: readonly BookingStatusValue[] | null) => (statuses ? all.filter((b) => statuses.includes(b.status)).length : all.length);

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[1.7rem] leading-tight font-semibold tracking-[-0.03em] text-forest sm:text-[2rem]">Bookings</h1>
          <p className="mt-1 text-[0.85rem] text-sage">{formatDayHeading(today, true)}. Every reservation, grouped by day.</p>
        </div>
        <ButtonLink href="/admin/bookings/new" size="sm" className="self-start px-5 sm:self-auto">
          + New booking
        </ButtonLink>
      </header>

      <nav aria-label="Status" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {STATUS_FILTERS.map((f) => {
          const active = f.key === filter.key;
          return (
            <Link
              key={f.key}
              href={`/admin/bookings?${rangeQuery}${f.key === "all" ? "" : `&status=${f.key}`}`}
              scroll={false}
              aria-current={active ? "true" : undefined}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[0.78rem] transition ${
                active ? "border-forest bg-forest text-white" : "border-sand/80 bg-white text-ink-soft hover:border-forest/40 hover:text-ink"
              }`}
            >
              {f.label}
              <span className={`rounded-full px-1.5 text-[0.7rem] tabular-nums ${active ? "bg-white/15" : "bg-cream"}`}>{countFor(f.statuses)}</span>
            </Link>
          );
        })}
      </nav>

      <UpcomingSection
        basePath="/admin/bookings"
        extraQuery={statusQuery}
        range={range}
        bookings={bookings}
        today={today}
        heading={filter.key === "all" ? "Schedule" : `${filter.label} bookings`}
      />
    </div>
  );
}
