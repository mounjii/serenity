import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RefreshWhilePending from "@/components/RefreshWhilePending";
import { WhatsAppIcon } from "@/components/Icons";
import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { getI18n } from "@/i18n/server";
import { fmt } from "@/i18n/format";
import { formatPrice } from "@/lib/format";
import { normalizePhone, whatsappLink } from "@/lib/phone";
import { customerCancelText, customerConfirmText } from "@/lib/whatsapp-text";
import { sweepExpiredBookings } from "@/server/booking/confirmation";
import { getPublicBooking } from "@/server/booking/public-booking";
import { getWhatsAppMode } from "@/server/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.confirmationTitle, robots: { index: false, follow: false } };
}

export default async function ConfirmationPage({ params }: PageProps<"/reservation/confirmation/[id]">) {
  await connection();
  await sweepExpiredBookings();
  const [{ id }, { t, locale, href }] = await Promise.all([params, getI18n()]);
  const booking = await getPublicBooking(id, locale);
  const c = t.confirmation;
  const statusText = {
    PENDING: { title: c.pendingTitle, note: c.pendingNote },
    CONFIRMED: { title: c.confirmedTitle, note: c.confirmedNote },
    COMPLETED: { title: c.completedTitle, note: c.completedNote },
    CANCELLED: { title: c.cancelledTitle, note: c.cancelledNote },
  };
  if (!booking) notFound();

  const ownerPhone = normalizePhone(process.env.OWNER_WHATSAPP_PHONE ?? "");
  const selfConfirm = booking.status === "PENDING" && getWhatsAppMode() !== "meta" && ownerPhone !== null;
  const messageInfo = { customerName: booking.firstName, serviceName: booking.serviceName, date: booking.date, time: booking.time, bookingId: booking.id, locale };
  const text = selfConfirm
    ? { title: c.selfTitle, note: c.selfNote }
    : statusText[booking.status];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="mx-auto max-w-xl px-5 sm:px-6">
          <section className="rounded-sm bg-white px-5 py-7 text-center shadow-[0_20px_40px_-28px_rgba(60,40,20,0.35)] sm:p-10">
            <div
              className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${
                booking.status === "CANCELLED"
                  ? "bg-cream-dark text-muted"
                  : booking.status === "PENDING"
                    ? "bg-gold/15 text-[#8a6a22]"
                    : "bg-forest text-cream"
              }`}
              aria-hidden
            >
              {booking.status === "PENDING" ? (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : booking.status === "CANCELLED" ? (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <p className="eyebrow mt-6">{c.eyebrow}</p>
            <h1 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">{text.title}</h1>
            {booking.firstName && booking.status === "CONFIRMED" && (
              <p className="mt-3 text-[0.9rem] font-light text-ink-soft">{fmt(c.thanks, { name: booking.firstName })}</p>
            )}

            <dl className="mt-8 divide-y divide-sand border-y border-sand text-start text-[0.9rem]">
              <Row label={t.booking.service} value={booking.serviceName} />
              <Row label={t.booking.date} value={booking.date} />
              <Row label={t.booking.time} value={booking.time} />
              <Row label={t.booking.price} value={formatPrice(booking.priceCents, locale)} />
            </dl>

            {booking.status === "PENDING" && (
              <>
                <RefreshWhilePending />
                <p className="mt-4 rounded-sm bg-gold/10 px-4 py-3 text-[0.85rem] text-ink-soft">
                  {booking.confirmUntil ? (
                    <>
                      {c.heldBefore} <strong className="font-medium text-ink">{booking.confirmUntil}</strong>
                      {c.heldAfter}
                    </>
                  ) : (
                    c.reserved
                  )}
                </p>
              </>
            )}
            {selfConfirm && ownerPhone && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <ButtonAnchor href={whatsappLink(ownerPhone, customerConfirmText(messageInfo))} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="h-4 w-4" aria-hidden />
                  {c.confirmWa}
                </ButtonAnchor>
                <ButtonAnchor href={whatsappLink(ownerPhone, customerCancelText(messageInfo))} target="_blank" rel="noopener noreferrer" variant="outline">
                  {c.cancelWa}
                </ButtonAnchor>
              </div>
            )}
            <p className="mt-6 text-[0.8rem] text-muted">{text.note}</p>
            <p className="mt-1 text-[0.8rem] text-muted">{t.booking.payAtSalon}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <ButtonLink href={href("/")}>{c.backHome}</ButtonLink>
              <ButtonLink href={href("/reservation")} variant="outline">
                {c.bookAnother}
              </ButtonLink>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-end text-ink">{value}</dd>
    </div>
  );
}
