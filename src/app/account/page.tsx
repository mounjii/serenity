import Link from "next/link";
import CustomerLogoutButton from "@/components/account/CustomerLogoutButton";
import LoyaltyAlerts from "@/components/account/LoyaltyAlerts";
import LoyaltyCard from "@/components/account/LoyaltyCard";
import { fmt } from "@/i18n/format";
import { getI18n } from "@/i18n/server";
import { formatPrice } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { RESERVATION_PATH } from "@/lib/navigation";
import { getCustomerBookings } from "@/server/customer/bookings";
import { getLoyaltyCard } from "@/server/loyalty/engine";
import { requireCustomerPage } from "@/server/customer/session";

export default async function AccountPage() {
  const session = await requireCustomerPage();
  const { t, locale, href } = await getI18n();
  const [bookings, card] = await Promise.all([getCustomerBookings(session.phone, locale), getLoyaltyCard(session.id, locale)]);
  const upcoming = bookings.filter((b) => b.upcoming);
  const past = bookings.filter((b) => !b.upcoming);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-lg bg-white px-5 py-4 shadow-[0_20px_40px_-32px_rgba(60,40,20,0.35)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h1 className="font-serif text-2xl text-ink sm:text-3xl">{fmt(t.account.hello, { name: session.name.split(" ")[0] ?? session.name })}</h1>
          <p className="mt-1 text-[0.85rem] text-ink-soft">{fmt(t.account.yourNumber, { phone: formatPhone(session.phone) })}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href={href(RESERVATION_PATH)}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 text-[0.78rem] tracking-wide text-cream transition hover:bg-black"
          >
            {t.account.bookCta}
          </Link>
          <CustomerLogoutButton />
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <LoyaltyCard card={card} />
        <div className="space-y-5">
          <LoyaltyAlerts alerts={card.alerts} />
          <section className="rounded-lg bg-white p-5 shadow-[0_20px_40px_-32px_rgba(60,40,20,0.35)] sm:p-6">
            <h2 className="font-serif text-2xl text-ink">{t.account.bookingsTitle}</h2>
            {bookings.length === 0 ? (
              <p className="mt-3 text-[0.9rem] text-ink-soft">{t.account.noBookings}</p>
            ) : (
              <div className="mt-4 space-y-5">
                {upcoming.length > 0 && (
                  <BookingGroup title={t.account.upcoming} bookings={upcoming} locale={locale} href={href} status={t.account.status} />
                )}
                {past.length > 0 && <BookingGroup title={t.account.past} bookings={past} locale={locale} href={href} status={t.account.status} />}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function BookingGroup({
  title,
  bookings,
  locale,
  href,
  status,
}: {
  title: string;
  bookings: Awaited<ReturnType<typeof getCustomerBookings>>;
  locale: "en" | "fr" | "ar";
  href: (path: string) => string;
  status: Record<"PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED", string>;
}) {
  return (
    <div>
      <h3 className="text-[0.78rem] tracking-wide text-muted uppercase">{title}</h3>
      <ul className="mt-2 space-y-2">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <Link
              href={href(`/reservation/confirmation/${booking.id}`)}
              className="block rounded-lg border border-sand/70 bg-cream/40 px-4 py-3 transition hover:border-ink/30"
            >
              <p className="font-medium text-ink">{booking.serviceName}</p>
              <p className="mt-1 text-[0.85rem] text-ink-soft">
                {booking.date} · {booking.time} · {formatPrice(booking.priceCents, locale)}
              </p>
              <p className="mt-1 text-[0.78rem] text-bronze">{status[booking.status]}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
