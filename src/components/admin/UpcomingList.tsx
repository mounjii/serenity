"use client";

import { ArrowRight } from "@/components/Icons";
import { formatDayHeading } from "@/lib/time";
import type { AdminBooking } from "@/server/admin/bookings";
import { useOpenBooking } from "./BookingDetails";
import { useHighlightedBookings } from "./LiveBookings";
import StatusBadge from "./StatusBadge";

type Props = { bookings: AdminBooking[]; today: string; emptyText: string };

function groupByDate(bookings: AdminBooking[]) {
  const groups = new Map<string, AdminBooking[]>();
  for (const b of bookings) groups.set(b.date, [...(groups.get(b.date) ?? []), b]);
  return [...groups.entries()];
}

export default function UpcomingList({ bookings, today, emptyText }: Props) {
  const openBooking = useOpenBooking();
  const highlighted = useHighlightedBookings();

  if (bookings.length === 0) {
    return <p className="rounded-md border border-sand/70 bg-white px-6 py-10 text-center text-[0.85rem] text-muted">{emptyText}</p>;
  }

  return (
    <div className="space-y-8">
      {groupByDate(bookings).map(([date, items]) => {
        const active = items.filter((b) => b.status !== "CANCELLED").length;
        return (
          <section key={date} aria-label={formatDayHeading(date)}>
            <div className="mb-3 flex items-baseline justify-between gap-4 px-1">
              <h3 className="text-[0.68rem] tracking-[0.26em] text-ink uppercase">
                {formatDayHeading(date)}
                {date === today && <span className="ml-2 text-muted">· Today</span>}
              </h3>
              <span className="text-[0.72rem] text-muted">
                {active} appointment{active === 1 ? "" : "s"}
              </span>
            </div>
            <ul className="divide-y divide-sand/70 overflow-hidden rounded-md border border-sand/70 bg-white">
              {items.map((b) => {
                const cancelled = b.status === "CANCELLED";
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => openBooking(b.id)}
                      className={`group grid w-full grid-cols-[4.25rem_1fr_auto] items-center gap-x-4 px-4 py-3.5 text-left transition-colors duration-300 hover:bg-cream/60 sm:grid-cols-[5rem_minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:px-6 ${
                        highlighted.has(b.id) ? "bg-gold/10" : ""
                      }`}
                    >
                      <span className={`font-serif text-[1.2rem] leading-none lining-nums tabular-nums ${cancelled ? "text-muted line-through" : "text-ink"}`}>
                        {b.time}
                      </span>
                      <span className="min-w-0">
                        <span className={`block truncate text-[0.92rem] font-medium ${cancelled ? "text-muted" : "text-ink"}`}>{b.customerName}</span>
                        <span className="block truncate text-[0.76rem] text-muted sm:hidden">{b.serviceName}</span>
                      </span>
                      <span className="hidden truncate text-[0.82rem] text-muted sm:block">{b.serviceName}</span>
                      <span className="flex items-center gap-3">
                        {b.status !== "CONFIRMED" && <StatusBadge status={b.status} />}
                        <ArrowRight className="h-3.5 w-3.5 text-muted opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
