import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import BookingActions from "@/components/admin/BookingActions";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatDuration, formatPrice } from "@/lib/format";
import { formatPhone, whatsappLink } from "@/lib/phone";
import { formatLongDate, toLocalTimeString } from "@/lib/time";
import { getAdminBooking } from "@/server/admin/bookings";
import { requireAdminPage } from "@/server/auth/session";

const stamp = (iso: string) => `${formatLongDate(new Date(iso))}, ${toLocalTimeString(new Date(iso))}`;

export default async function AdminBookingPage({ params }: PageProps<"/admin/bookings/[id]">) {
  await connection();
  await requireAdminPage();
  const { id } = await params;
  const booking = await getAdminBooking(id);
  if (!booking) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="text-[0.8rem] text-ink-soft hover:text-ink">← Back to dashboard</Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-4xl text-ink">{booking.customerName}</h1>
        <StatusBadge status={booking.status} />
      </div>
      <p className="mt-1 text-[0.9rem] text-ink-soft">
        {booking.serviceName} · {booking.dateLabel} · {booking.time} – {booking.endTime}
      </p>

      <section className="mt-8 rounded-sm bg-white p-6 shadow-[0_20px_40px_-32px_rgba(60,40,20,0.35)] sm:p-8">
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
          <Item label="Booked">{`${stamp(booking.createdAt)} · ${booking.source === "ADMIN" ? "by admin" : "online"}`}</Item>
          {booking.cancelledAt && <Item label="Cancelled">{stamp(booking.cancelledAt)}</Item>}
          {booking.completedAt && <Item label="Completed">{stamp(booking.completedAt)}</Item>}
          <div className="sm:col-span-2">
            <dt className="text-[0.72rem] tracking-[0.2em] text-muted uppercase">Note</dt>
            <dd className="mt-1.5 rounded-sm bg-cream px-4 py-3 whitespace-pre-wrap text-ink">
              {booking.note ?? <span className="text-muted">No note.</span>}
            </dd>
          </div>
        </dl>

        <div className="mt-8 border-t border-sand pt-6">
          <BookingActions booking={booking} />
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
