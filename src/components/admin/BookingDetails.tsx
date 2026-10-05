"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/Icons";
import { CANCEL_REASON_LABEL } from "@/lib/booking-status";
import { formatDuration, formatPrice } from "@/lib/format";
import { formatPhone, whatsappLink } from "@/lib/phone";
import { bookingRef } from "@/lib/whatsapp-text";
import type { AdminBooking } from "@/server/admin/bookings";
import type { WhatsAppMode } from "@/server/whatsapp";
import BookingActions from "./BookingActions";
import StatusBadge from "./StatusBadge";

const OpenBookingContext = createContext<(id: string) => void>(() => {});

export function useOpenBooking() {
  return useContext(OpenBookingContext);
}


/** Side panel with the full reservation; rows anywhere inside call useOpenBooking()(id). */
export default function BookingDetailsProvider({
  bookings,
  whatsappMode = "mock",
  children,
}: {
  bookings: AdminBooking[];
  whatsappMode?: WhatsAppMode;
  children: React.ReactNode;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const booking = bookings.find((b) => b.id === selectedId) ?? null;

  const openBooking = useCallback((id: string) => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelectedId(id);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      returnFocus.current?.focus();
    };
  }, [open, close]);

  const visible = open && booking !== null;

  return (
    <OpenBookingContext.Provider value={openBooking}>
      {children}
      <div className={`fixed inset-0 z-50 ${visible ? "" : "pointer-events-none"}`} aria-hidden={!visible}>
        <div
          onClick={close}
          className={`absolute inset-0 bg-ink/20 transition-opacity duration-300 motion-reduce:transition-none ${visible ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-details-title"
          tabIndex={-1}
          inert={!visible}
          className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-[-24px_0_48px_-32px_rgba(42,40,36,0.35)] outline-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            visible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {booking && <DetailsContent booking={booking} whatsappMode={whatsappMode} onClose={close} />}
        </aside>
      </div>
    </OpenBookingContext.Provider>
  );
}

function DetailsContent({ booking, whatsappMode, onClose }: { booking: AdminBooking; whatsappMode: WhatsAppMode; onClose: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-sand/70 px-6 py-4">
        <p className="text-[0.66rem] tracking-[0.28em] text-muted uppercase">Reservation</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition hover:bg-white hover:text-ink"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <h2 id="booking-details-title" className="font-serif text-[2rem] leading-tight text-ink">
          {booking.customerName}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.85rem] text-ink-soft">
          <span>{booking.serviceName}</span>
          <StatusBadge status={booking.status} />
        </div>

        <section className="mt-6 rounded-md border border-sand/70 bg-white p-4">
          <p className="text-[0.66rem] tracking-[0.24em] text-muted uppercase">Phone</p>
          <a href={`tel:${booking.customerPhone}`} className="mt-1 block text-[1.05rem] text-ink underline-offset-4 hover:underline">
            {formatPhone(booking.customerPhone)}
          </a>
          <div className="mt-3 flex gap-2">
            <a
              href={whatsappLink(booking.customerPhone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-full bg-olive px-4 py-2 text-center text-[0.75rem] tracking-wide text-cream transition hover:bg-olive-dark"
            >
              WhatsApp
            </a>
            <a
              href={`tel:${booking.customerPhone}`}
              className="flex-1 rounded-full border border-sand px-4 py-2 text-center text-[0.75rem] tracking-wide text-ink transition hover:border-ink"
            >
              Call
            </a>
          </div>
        </section>

        <dl className="mt-6 divide-y divide-sand/70 text-[0.88rem]">
          <Row label="Date">{booking.dateLabel}</Row>
          <Row label="Time">{`${booking.time} – ${booking.endTime} · ${formatDuration(booking.durationMinutes)}`}</Row>
          <Row label="Treatment">{booking.serviceName}</Row>
          <Row label="Price">{formatPrice(booking.priceCents)}</Row>
          <Row label="Therapist">{booking.therapistName}</Row>
          <Row label="Ref">{bookingRef(booking.id)}</Row>
          <Row label="Booked">{`${booking.labels.created} · ${booking.source === "ADMIN" ? "by admin" : "online"}`}</Row>
          {booking.labels.confirmed && <Row label="Confirmed">{booking.labels.confirmed}</Row>}
          {booking.labels.cancelled && (
            <Row label="Cancelled">{`${booking.labels.cancelled}${booking.cancelReason ? ` · ${CANCEL_REASON_LABEL[booking.cancelReason]}` : ""}`}</Row>
          )}
          {booking.labels.completed && <Row label="Completed">{booking.labels.completed}</Row>}
        </dl>

        <div className="mt-6">
          <p className="text-[0.66rem] tracking-[0.24em] text-muted uppercase">Note</p>
          <p className="mt-2 rounded-md bg-white px-4 py-3 text-[0.88rem] whitespace-pre-wrap text-ink">
            {booking.note ?? <span className="text-muted">No note.</span>}
          </p>
        </div>
      </div>

      <div className="space-y-4 border-t border-sand/70 bg-cream px-6 py-5">
        <BookingActions booking={booking} whatsappMode={whatsappMode} />
        <Link href={`/admin/bookings/${booking.id}`} className="inline-block text-[0.75rem] text-ink-soft underline-offset-4 hover:text-ink hover:underline">
          Open full page →
        </Link>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3">
      <dt className="shrink-0 text-[0.7rem] tracking-[0.18em] text-muted uppercase">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}
