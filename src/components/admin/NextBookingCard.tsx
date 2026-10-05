"use client";

import { ArrowRight } from "@/components/Icons";
import type { AdminBooking } from "@/server/admin/bookings";
import { useOpenBooking } from "./BookingDetails";

export default function NextBookingCard({ booking, isToday }: { booking: AdminBooking | null; isToday: boolean }) {
  const openBooking = useOpenBooking();
  const label = <p className="text-[0.66rem] tracking-[0.26em] text-muted uppercase">Next reservation</p>;

  if (!booking) {
    return (
      <div className="rounded-md border border-sand/70 bg-white px-6 py-5 sm:order-first sm:col-span-2 lg:order-none lg:col-span-1">
        {label}
        <p className="mt-4 text-[0.9rem] text-muted">No upcoming reservations.</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openBooking(booking.id)}
      className="group rounded-md border border-sand/70 bg-white px-6 py-5 text-left transition-colors duration-300 hover:border-ink/25 sm:order-first sm:col-span-2 lg:order-none lg:col-span-1"
    >
      <div className="flex items-center justify-between gap-3">
        {label}
        <ArrowRight className="h-3.5 w-3.5 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
      </div>
      <p className="mt-3 font-serif text-[2.75rem] leading-none text-ink lining-nums tabular-nums">
        {booking.time}
        {!isToday && <span className="ml-3 align-middle font-sans text-[0.78rem] text-muted">{booking.dateLabel}</span>}
      </p>
      <p className="mt-2 truncate text-[0.85rem] text-ink-soft">
        <span className="font-medium text-ink">{booking.customerName}</span> · {booking.serviceName}
      </p>
    </button>
  );
}
