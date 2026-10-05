"use client";

import { whatsappLink } from "@/lib/phone";
import type { AdminBooking } from "@/server/admin/bookings";
import { useOpenBooking } from "./BookingDetails";
import StatusBadge from "./StatusBadge";

type Props = { booking: AdminBooking; showDate?: boolean; highlighted?: boolean };

export default function BookingRow({ booking, showDate = false, highlighted = false }: Props) {
  const openBooking = useOpenBooking();
  const cancelled = booking.status === "CANCELLED";
  return (
    <li
      className={`group flex flex-col gap-4 rounded-md border border-sand/70 bg-white p-4 transition-colors duration-300 hover:bg-cream/60 sm:flex-row sm:items-center sm:gap-6 sm:rounded-none sm:border-0 sm:px-6 sm:py-5 ${
        highlighted ? "bg-gold/10" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => openBooking(booking.id)}
        className="flex min-w-0 flex-1 flex-col gap-2 text-left sm:flex-row sm:items-center sm:gap-6"
      >
        <span className="shrink-0 sm:w-40">
          <span className={`block font-serif text-[1.45rem] leading-none lining-nums tabular-nums ${cancelled ? "text-muted line-through" : "text-ink"}`}>
            {booking.time}
            <span className="text-[0.95rem] text-muted"> – {booking.endTime}</span>
          </span>
          {showDate && <span className="mt-1 block text-[0.7rem] text-muted">{booking.dateLabel}</span>}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className={`truncate text-[1rem] font-medium ${cancelled ? "text-muted" : "text-ink"}`}>{booking.customerName}</span>
            {highlighted && <span className="rounded-full bg-gold px-2 py-0.5 text-[0.6rem] tracking-wide text-white uppercase">New</span>}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8rem] text-muted">
            <span>{booking.serviceName}</span>
            {booking.source === "ADMIN" && <span>· added by admin</span>}
            <StatusBadge status={booking.status} />
          </span>
        </span>
      </button>

      <div className="flex items-center gap-2 border-t border-sand/60 pt-3 sm:border-0 sm:pt-0">
        <a
          href={whatsappLink(booking.customerPhone)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full border border-sand px-4 py-1.5 text-center text-[0.74rem] text-ink-soft transition hover:border-olive hover:text-olive sm:flex-none"
        >
          WhatsApp
        </a>
        <button
          type="button"
          onClick={() => openBooking(booking.id)}
          className="flex-1 rounded-full border border-transparent px-4 py-1.5 text-[0.74rem] text-ink transition group-hover:border-sand hover:border-ink! sm:flex-none"
        >
          Details
        </button>
      </div>
    </li>
  );
}
