import Link from "next/link";
import { formatPhone, whatsappLink } from "@/lib/phone";
import type { AdminBooking } from "@/server/admin/bookings";
import StatusBadge from "./StatusBadge";

type Props = { booking: AdminBooking; showDate?: boolean; highlighted?: boolean };

export default function BookingRow({ booking, showDate = false, highlighted = false }: Props) {
  const cancelled = booking.status === "CANCELLED";
  return (
    <li
      className={`flex flex-col gap-3 px-4 py-4 transition-colors duration-700 sm:flex-row sm:items-center sm:gap-6 sm:px-5 ${
        highlighted ? "bg-gold/15" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3 sm:w-36 sm:flex-col sm:items-start sm:justify-center sm:gap-0.5">
        <span className={`font-serif text-xl leading-none ${cancelled ? "text-muted line-through" : "text-ink"}`}>
          {booking.time}
          <span className="text-[0.8rem] text-muted"> – {booking.endTime}</span>
        </span>
        {showDate && <span className="text-[0.72rem] text-muted">{booking.dateLabel}</span>}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium text-ink">{booking.customerName}</span>
          <StatusBadge status={booking.status} />
          {highlighted && <span className="rounded-full bg-gold px-2 py-0.5 text-[0.65rem] tracking-wide text-white uppercase">New</span>}
        </div>
        <p className="mt-0.5 text-[0.8rem] text-ink-soft">
          {booking.serviceName}
          {booking.source === "ADMIN" && <span className="text-muted"> · added by admin</span>}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <a href={`tel:${booking.customerPhone}`} className="rounded-full border border-sand px-3 py-1.5 text-[0.75rem] text-ink transition hover:border-ink">
          {formatPhone(booking.customerPhone)}
        </a>
        <a
          href={whatsappLink(booking.customerPhone)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-emerald-200 px-3 py-1.5 text-[0.75rem] text-emerald-800 transition hover:border-emerald-500"
        >
          WhatsApp
        </a>
        <Link href={`/admin/bookings/${booking.id}`} className="rounded-full bg-olive px-3 py-1.5 text-[0.75rem] text-white transition hover:bg-olive-dark">
          Details
        </Link>
      </div>
    </li>
  );
}
