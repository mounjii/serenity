"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, ClockIcon } from "@/components/Icons";
import { useI18n } from "@/i18n/client";
import { formatDuration, formatPrice } from "@/lib/format";
import { serviceImage } from "@/lib/images";
import type { CustomerBooking } from "@/server/customer/bookings";

export default function BookingTabs({ bookings }: { bookings: CustomerBooking[] }) {
  const { t, locale, href } = useI18n();
  const upcoming = bookings.filter((b) => b.upcoming);
  const past = bookings.filter((b) => !b.upcoming);
  const both = upcoming.length > 0 && past.length > 0;
  const [tab, setTab] = useState<"upcoming" | "past">(upcoming.length > 0 ? "upcoming" : "past");
  const shown = both ? (tab === "upcoming" ? upcoming : past) : bookings;

  return (
    <section id="bookings" className="scroll-mt-28 rounded-2xl border border-sand bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.03em] text-ink">{t.account.bookingsTitle}</h1>
        {both && (
          <div className="flex rounded-full border border-sand p-0.5" role="group" aria-label={t.account.bookingsTitle}>
            {(
              [
                ["upcoming", `${t.account.upcoming} (${upcoming.length})`],
                ["past", t.account.past],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={tab === key}
                onClick={() => setTab(key)}
                className={`rounded-full px-3 py-1.5 text-[0.74rem] font-medium transition ${
                  tab === key ? "bg-forest text-white" : "text-sage hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="px-2 py-10 text-center text-[0.85rem] text-sage">{t.account.noBookings}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {shown.map((booking) => (
            <li key={booking.id}>
              <Link
                href={href(`/reservation/confirmation/${booking.id}`)}
                className="flex items-center gap-3 rounded-2xl border border-sand p-3 transition hover:border-black/25"
              >
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ivory">
                  <Image src={serviceImage(booking.serviceSlug)} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.92rem] font-medium text-ink">{booking.serviceName}</span>
                  <span className="mt-0.5 block truncate text-[0.78rem] text-sage">
                    {booking.date}, {booking.time}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-sage">
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {formatDuration(booking.durationMinutes, locale)}
                    </span>
                    <span>{formatPrice(booking.priceCents, locale)}</span>
                  </span>
                </span>
                <span className="hidden text-right text-[0.72rem] text-sage sm:block">{t.account.status[booking.status]}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-sage rtl:-scale-x-100" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
