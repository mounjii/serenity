import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RefreshWhilePending from "@/components/RefreshWhilePending";
import { WhatsAppIcon } from "@/components/Icons";
import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { normalizePhone, whatsappLink } from "@/lib/phone";
import { customerCancelText, customerConfirmText } from "@/lib/whatsapp-text";
import { sweepExpiredBookings } from "@/server/booking/confirmation";
import { getPublicBooking } from "@/server/booking/public-booking";
import { getWhatsAppMode } from "@/server/whatsapp";

export const metadata: Metadata = {
  title: "Your reservation — Touch Sense",
  robots: { index: false, follow: false },
};

const STATUS_TEXT = {
  PENDING: { title: "Confirm your reservation on WhatsApp", note: "We sent you a WhatsApp message. Tap “Confirm” to secure your time." },
  CONFIRMED: { title: "Your reservation is confirmed", note: "Your confirmation has been sent to you on WhatsApp." },
  COMPLETED: { title: "Thank you for your visit", note: "We hope to see you again soon." },
  CANCELLED: { title: "This reservation was cancelled", note: "Feel free to book another time that suits you." },
} as const;

export default async function ConfirmationPage({ params }: PageProps<"/reservation/confirmation/[id]">) {
  await connection();
  await sweepExpiredBookings();
  const { id } = await params;
  const booking = await getPublicBooking(id);
  if (!booking) notFound();

  const ownerPhone = normalizePhone(process.env.OWNER_WHATSAPP_PHONE ?? "");
  const selfConfirm = booking.status === "PENDING" && getWhatsAppMode() !== "meta" && ownerPhone !== null;
  const messageInfo = { customerName: booking.firstName, serviceName: booking.serviceName, date: booking.date, time: booking.time, bookingId: booking.id };
  const text = selfConfirm
    ? { title: "One last step: confirm on WhatsApp", note: "Tap the button, then press send in WhatsApp. We confirm your time as soon as we see your message." }
    : STATUS_TEXT[booking.status];

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
            <p className="eyebrow mt-6">Reservation</p>
            <h1 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">{text.title}</h1>
            {booking.firstName && booking.status === "CONFIRMED" && (
              <p className="mt-3 text-[0.9rem] font-light text-ink-soft">Thank you, {booking.firstName}. We look forward to welcoming you.</p>
            )}

            <dl className="mt-8 divide-y divide-sand border-y border-sand text-left text-[0.9rem]">
              <Row label="Service" value={booking.serviceName} />
              <Row label="Date" value={booking.date} />
              <Row label="Time" value={booking.time} />
              <Row label="Price" value={formatPrice(booking.priceCents)} />
            </dl>

            {booking.status === "PENDING" && (
              <>
                <RefreshWhilePending />
                <p className="mt-4 rounded-sm bg-gold/10 px-4 py-3 text-[0.85rem] text-ink-soft">
                  {booking.confirmUntil ? (
                    <>
                      Your time is held until <strong className="font-medium text-ink">{booking.confirmUntil}</strong>. Without confirmation,
                      the reservation is cancelled automatically.
                    </>
                  ) : (
                    "Your time is reserved. Send us your confirmation on WhatsApp and we will confirm your booking."
                  )}
                </p>
              </>
            )}
            {selfConfirm && ownerPhone && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <ButtonAnchor href={whatsappLink(ownerPhone, customerConfirmText(messageInfo))} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="h-4 w-4" aria-hidden />
                  Confirm on WhatsApp
                </ButtonAnchor>
                <ButtonAnchor href={whatsappLink(ownerPhone, customerCancelText(messageInfo))} target="_blank" rel="noopener noreferrer" variant="outline">
                  Cancel on WhatsApp
                </ButtonAnchor>
              </div>
            )}
            <p className="mt-6 text-[0.8rem] text-muted">{text.note}</p>
            <p className="mt-1 text-[0.8rem] text-muted">Payment is made at the salon.</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <ButtonLink href="/">Back to home</ButtonLink>
              <ButtonLink href="/reservation" variant="outline">Book another massage</ButtonLink>
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
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
