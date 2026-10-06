"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarIcon, ChevronRight, ClockIcon, WhatsAppIcon } from "@/components/Icons";
import type { BookingStatusValue } from "@/lib/booking-status";
import { serviceImage } from "@/lib/images";
import { whatsappLink } from "@/lib/phone";
import { formatShortDate } from "@/lib/time";
import type { ActivityEvent, ActivityTone } from "@/server/admin/activity";
import type { AdminBooking } from "@/server/admin/bookings";
import { useOpenBooking } from "./BookingDetails";
import { useHighlightedBookings } from "./LiveBookings";
import StatusBadge from "./StatusBadge";

const dotColor: Record<BookingStatusValue, string> = {
  CONFIRMED: "bg-olive",
  PENDING: "bg-gold",
  CANCELLED: "bg-red-400",
  COMPLETED: "bg-muted",
};

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`rounded-2xl border border-sand/60 bg-white shadow-[0_1px_2px_rgba(42,40,36,0.04)] ${className}`}>{children}</section>;
}

export function NextAppointmentCard({ booking, isToday }: { booking: AdminBooking | null; isToday: boolean }) {
  const openBooking = useOpenBooking();
  const inner = (
    <>
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#dfe8f5] text-[#4a6c9c]">
        <ClockIcon className="h-[1.1rem] w-[1.1rem]" />
      </span>
      <span className="mt-3 block text-[0.78rem] text-ink-soft">Next appointment</span>
      {booking ? (
        <>
          <span className="mt-1 block font-serif text-[2.3rem] leading-none text-ink lining-nums tabular-nums">
            {booking.time}
            {!isToday && <span className="ml-2 align-middle font-sans text-[0.72rem] text-muted">{formatShortDate(booking.date)}</span>}
          </span>
          <span className="mt-2 block truncate text-[0.78rem] font-medium tracking-wide text-ink uppercase">{booking.customerName}</span>
          <span className="block truncate text-[0.76rem] text-muted">{booking.serviceName}</span>
        </>
      ) : (
        <span className="mt-3 block text-[0.85rem] text-muted">No upcoming appointments.</span>
      )}
    </>
  );
  const className = "group relative block h-full rounded-2xl border border-[#dbe5f2] bg-[#f1f5fb] p-4 text-left sm:p-5";
  if (!booking) return <div className={className}>{inner}</div>;
  return (
    <button type="button" onClick={() => openBooking(booking.id)} className={`${className} w-full transition hover:border-[#b9cbe4]`}>
      {inner}
      <ChevronRight className="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-ink transition group-hover:translate-x-0.5" />
    </button>
  );
}

export function TodaySchedule({ bookings, dateLabel }: { bookings: AdminBooking[]; dateLabel: string }) {
  const openBooking = useOpenBooking();
  const highlighted = useHighlightedBookings();

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 px-4 pt-5 pb-3 sm:px-6">
        <div>
          <h2 className="text-[1.1rem] font-medium text-ink">Today’s schedule</h2>
          <p className="mt-0.5 text-[0.78rem] text-muted">{dateLabel}</p>
        </div>
        <Link
          href="/admin/bookings?view=week"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-sand/80 bg-cream/60 px-3 py-2 text-[0.74rem] text-ink transition hover:border-ink/40"
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="hidden sm:inline">View calendar</span>
          <span className="sm:hidden">All</span>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <p className="px-6 pt-4 pb-10 text-center text-[0.85rem] text-muted">No appointments today. Enjoy a calm day.</p>
      ) : (
        <ol className="px-2 pb-2 sm:px-3">
          {bookings.map((b, i) => {
            const cancelled = b.status === "CANCELLED";
            const last = i === bookings.length - 1;
            return (
              <li
                key={b.id}
                className={`grid grid-cols-[3rem_0.75rem_minmax(0,1fr)] gap-x-3 rounded-xl px-2 py-3 transition-colors sm:grid-cols-[3.5rem_0.75rem_minmax(0,1fr)_auto] sm:gap-x-4 sm:px-3 ${
                  highlighted.has(b.id) ? "bg-gold/10" : ""
                } ${last ? "" : "border-b border-sand/50"}`}
              >
                <div className={`pt-1 lining-nums tabular-nums ${cancelled ? "text-muted line-through" : "text-ink"}`}>
                  <p className="text-[0.95rem] font-medium">{b.time}</p>
                  <p className="text-[0.75rem] text-muted">{b.endTime}</p>
                </div>

                <div className="relative row-span-2 flex justify-center sm:row-span-1">
                  <span className={`relative z-10 mt-2.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${dotColor[b.status]}`} />
                  {!last && <span className="absolute top-5 -bottom-4 w-px bg-sand" aria-hidden />}
                </div>

                <button type="button" onClick={() => openBooking(b.id)} className="flex min-w-0 items-center gap-3 text-left sm:gap-4">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-sand sm:h-[3.75rem] sm:w-[4.5rem]">
                    <Image src={serviceImage(b.serviceSlug)} alt="" fill sizes="72px" className={`object-cover ${cancelled ? "opacity-60 grayscale" : ""}`} />
                  </span>
                  <span className="min-w-0">
                    <span className={`flex items-center gap-2 text-[0.92rem] font-medium ${cancelled ? "text-muted" : "text-ink"}`}>
                      <span className="truncate">{b.customerName}</span>
                      {highlighted.has(b.id) && <span className="rounded-full bg-gold px-1.5 py-0.5 text-[0.55rem] tracking-wide text-white uppercase">New</span>}
                    </span>
                    <span className="block truncate text-[0.78rem] text-muted">{b.serviceName}</span>
                    <span className="mt-1.5 block">
                      <StatusBadge status={b.status} />
                    </span>
                  </span>
                </button>

                <div className="col-start-3 mt-3 flex gap-2 sm:col-start-4 sm:row-start-1 sm:mt-0 sm:items-center">
                  <a
                    href={whatsappLink(b.customerPhone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-sand/80 px-3 py-2 text-[0.76rem] text-ink transition hover:border-olive hover:text-olive sm:flex-none"
                  >
                    <WhatsAppIcon className="h-4 w-4 text-olive" />
                    WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => openBooking(b.id)}
                    className="flex-1 rounded-lg border border-sand/80 px-4 py-2 text-[0.76rem] text-ink transition hover:border-ink/50 sm:flex-none"
                  >
                    Details
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

export const activityToneColor: Record<ActivityTone, string> = {
  green: "bg-olive",
  red: "bg-red-400",
  amber: "bg-gold",
  grey: "bg-muted",
  blue: "bg-[#5b7fb5]",
};

export function ActivityList({ events }: { events: ActivityEvent[] }) {
  const openBooking = useOpenBooking();
  return (
    <ul className="space-y-0.5">
      {events.map((e) => (
        <li key={e.key}>
          <button
            type="button"
            onClick={() => openBooking(e.booking.id)}
            className="grid w-full grid-cols-[0.5rem_minmax(0,1fr)_auto] items-start gap-3 rounded-lg px-1.5 py-2 text-left transition hover:bg-cream/70"
          >
            <span className={`mt-1.5 h-2 w-2 rounded-full ${activityToneColor[e.tone]}`} aria-hidden />
            <span className="min-w-0">
              <span className="block text-[0.82rem] text-ink">{e.title}</span>
              <span className="block truncate text-[0.74rem] text-muted">{e.detail}</span>
            </span>
            <span className="pt-0.5 text-[0.7rem] whitespace-nowrap text-muted">{e.ago}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function RecentActivity({ events }: { events: ActivityEvent[] }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[1rem] font-medium text-ink">Recent activity</h2>
        <Link href="/admin/activity" className="text-[0.74rem] text-ink-soft underline-offset-4 hover:text-ink hover:underline">
          See all
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="mt-4 text-[0.82rem] text-muted">No activity yet.</p>
      ) : (
        <div className="mt-3">
          <ActivityList events={events} />
        </div>
      )}
    </Card>
  );
}

type Range = { view: string; date?: string; title: string };

const TABS = [
  { view: "today", label: "Today" },
  { view: "tomorrow", label: "Tomorrow" },
  { view: "week", label: "This week" },
];

export function UpcomingAppointments({ range, bookings }: { range: Range; bookings: AdminBooking[] }) {
  const openBooking = useOpenBooking();
  const highlighted = useHighlightedBookings();
  const router = useRouter();

  return (
    <Card>
      <div id="upcoming" className="flex scroll-mt-24 flex-col gap-3 px-4 pt-5 pb-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-[1.1rem] font-medium text-ink">Upcoming appointments</h2>
          <p className="mt-0.5 text-[0.78rem] text-muted">{range.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 rounded-lg border border-sand/80 p-0.5 sm:flex-none" role="group" aria-label="Period">
            {TABS.map((t) => (
              <Link
                key={t.view}
                href={`/admin?view=${t.view}#upcoming`}
                scroll={false}
                aria-current={range.view === t.view ? "true" : undefined}
                className={`flex-1 rounded-md px-3 py-1.5 text-center text-[0.74rem] whitespace-nowrap transition sm:flex-none ${
                  range.view === t.view ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
          <label
            className={`relative grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border transition ${
              range.view === "date" ? "border-ink bg-ink text-cream" : "border-sand/80 text-ink hover:border-ink/40"
            }`}
          >
            <span className="sr-only">Pick a date</span>
            <CalendarIcon className="h-4 w-4" />
            <input
              type="date"
              defaultValue={range.view === "date" ? range.date : undefined}
              onChange={(e) => e.target.value && router.push(`/admin?view=date&date=${e.target.value}#upcoming`, { scroll: false })}
              className="absolute inset-0 cursor-pointer opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </label>
        </div>
      </div>

      {bookings.length === 0 ? (
        <p className="px-6 pt-4 pb-10 text-center text-[0.85rem] text-muted">No appointments for this period.</p>
      ) : (
        <>
          <ul className="divide-y divide-sand/50 px-2 pb-2 sm:hidden">
            {bookings.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => openBooking(b.id)}
                  className={`grid w-full grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-3 text-left ${highlighted.has(b.id) ? "bg-gold/10" : ""}`}
                >
                  <span className="lining-nums tabular-nums">
                    <span className="block text-[0.7rem] text-muted">{formatShortDate(b.date)}</span>
                    <span className={`block text-[0.92rem] font-medium ${b.status === "CANCELLED" ? "text-muted line-through" : "text-ink"}`}>{b.time}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[0.88rem] text-ink">{b.customerName}</span>
                    <span className="block truncate text-[0.74rem] text-muted">{b.serviceName}</span>
                  </span>
                  <StatusBadge status={b.status} />
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto px-3 pb-3 sm:block">
            <table className="w-full text-left text-[0.8rem]">
              <thead>
                <tr className="text-[0.72rem] text-muted">
                  <th className="rounded-l-lg bg-cream/70 px-3 py-2.5 font-normal">Date</th>
                  <th className="bg-cream/70 px-3 py-2.5 font-normal">Time</th>
                  <th className="bg-cream/70 px-3 py-2.5 font-normal">Client</th>
                  <th className="bg-cream/70 px-3 py-2.5 font-normal">Service</th>
                  <th className="bg-cream/70 px-3 py-2.5 font-normal">Status</th>
                  <th className="rounded-r-lg bg-cream/70 px-3 py-2.5 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/50">
                {bookings.map((b) => (
                  <tr key={b.id} className={`transition-colors hover:bg-cream/50 ${highlighted.has(b.id) ? "bg-gold/10" : ""}`}>
                    <td className="px-3 py-3 whitespace-nowrap text-ink-soft">{formatShortDate(b.date)}</td>
                    <td className={`px-3 py-3 whitespace-nowrap lining-nums tabular-nums ${b.status === "CANCELLED" ? "text-muted line-through" : "text-ink"}`}>
                      {b.time} – {b.endTime}
                    </td>
                    <td className="max-w-[12rem] truncate px-3 py-3 text-ink">{b.customerName}</td>
                    <td className="max-w-[12rem] truncate px-3 py-3 text-ink-soft">{b.serviceName}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={whatsappLink(b.customerPhone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp ${b.customerName}`}
                          className="grid h-8 w-8 place-items-center rounded-lg text-olive transition hover:bg-olive/10"
                        >
                          <WhatsAppIcon className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openBooking(b.id)}
                          aria-label={`Details for ${b.customerName}`}
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink transition hover:bg-cream"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
