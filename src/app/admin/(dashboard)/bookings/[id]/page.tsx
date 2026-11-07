import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import BookingActions from "@/components/admin/BookingActions";
import CustomerAvatar from "@/components/admin/CustomerAvatar";
import StatusBadge from "@/components/admin/StatusBadge";
import { CANCEL_REASON_LABEL } from "@/lib/booking-status";
import { formatDuration, formatPrice } from "@/lib/format";
import { formatPhone, whatsappLink } from "@/lib/phone";
import { bookingRef } from "@/lib/whatsapp-text";
import { formatLongDate, toLocalTimeString } from "@/lib/time";
import { getAdminBooking } from "@/server/admin/bookings";
import { requireArea } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { sweepExpiredBookings } from "@/server/booking/confirmation";
import { getWhatsAppMode } from "@/server/whatsapp";

const stamp = (iso: string) => `${formatLongDate(new Date(iso))}, ${toLocalTimeString(new Date(iso))}`;

export default async function AdminBookingPage({ params }: PageProps<"/admin/bookings/[id]">) {
  await connection();
  await requireArea("bookings");
  await sweepExpiredBookings();
  const { id } = await params;
  const booking = await getAdminBooking(id);
  if (!booking) notFound();
  const account = await getDb().customer.findUnique({
    where: { phone: booking.customerPhone },
    select: { id: true, avatarType: true, updatedAt: true },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/bookings" className="text-[0.8rem] text-sage hover:text-forest">
        ← Back to bookings
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {account ? (
          <CustomerAvatar
            id={account.id}
            name={booking.customerName}
            updatedAt={account.avatarType ? account.updatedAt.toISOString() : null}
            size="lg"
          />
        ) : null}
        <h1 className="text-[1.7rem] leading-tight font-semibold tracking-[-0.03em] text-forest sm:text-[2rem]">{booking.customerName}</h1>
        <StatusBadge status={booking.status} />
      </div>
      <p className="mt-1 text-[0.85rem] text-sage">
        {booking.serviceName} · {booking.dateLabel} · {booking.time} – {booking.endTime}
      </p>

      <section className="mt-5 rounded-2xl border border-sand bg-white p-5 sm:p-6">
        <dl className="grid gap-x-8 gap-y-5 text-[0.9rem] sm:grid-cols-2">
          <Item label="Phone">
            <span className="flex flex-wrap items-center gap-2">
              <a href={`tel:${booking.customerPhone}`} className="text-ink underline-offset-4 hover:underline">
                {formatPhone(booking.customerPhone)}
              </a>
              <a
                href={whatsappLink(booking.customerPhone)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-emerald-200 px-3 py-1 text-[0.75rem] text-emerald-800 hover:border-emerald-500"
              >
                WhatsApp
              </a>
            </span>
          </Item>
          <Item label="Service">{booking.serviceName}</Item>
          <Item label="Date">{booking.dateLabel}</Item>
          <Item label="Time">{`${booking.time} – ${booking.endTime} (${formatDuration(booking.durationMinutes)})`}</Item>
          <Item label="Price">{formatPrice(booking.priceCents)}</Item>
          <Item label="Therapist">{booking.therapistName}</Item>
          <Item label="Ref">{bookingRef(booking.id)}</Item>
          <Item label="Booked">{`${stamp(booking.createdAt)} · ${booking.source === "ADMIN" ? "by admin" : "online"}`}</Item>
          {booking.confirmedAt && <Item label="Confirmed">{stamp(booking.confirmedAt)}</Item>}
          {booking.cancelledAt && (
            <Item label="Cancelled">{`${stamp(booking.cancelledAt)}${booking.cancelReason ? ` · ${CANCEL_REASON_LABEL[booking.cancelReason]}` : ""}`}</Item>
          )}
          {booking.completedAt && <Item label="Completed">{stamp(booking.completedAt)}</Item>}
          <div className="sm:col-span-2">
            <dt className="text-[0.72rem] tracking-[0.2em] text-muted uppercase">Note</dt>
            <dd className="mt-1.5 rounded-lg bg-cream px-4 py-3 whitespace-pre-wrap text-ink">
              {booking.note ?? <span className="text-muted">No note.</span>}
            </dd>
          </div>
        </dl>

        <div className="mt-8 border-t border-sand pt-6">
          <BookingActions booking={booking} whatsappMode={getWhatsAppMode()} />
        </div>
      </section>
    </div>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.72rem] tracking-[0.2em] text-muted uppercase">{label}</dt>
      <dd className="mt-1 text-ink">{children}</dd>
    </div>
  );
}
