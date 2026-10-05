import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { getPublicBooking } from "@/server/booking/public-booking";

export const metadata: Metadata = {
  title: "Reservation confirmed — Touch Sense",
  robots: { index: false, follow: false },
};

const STATUS_TEXT = {
  CONFIRMED: { title: "Your reservation is confirmed", note: "A confirmation will be sent to you on WhatsApp." },
  COMPLETED: { title: "Thank you for your visit", note: "We hope to see you again soon." },
  CANCELLED: { title: "This reservation was cancelled", note: "Feel free to book another time that suits you." },
} as const;

export default async function ConfirmationPage({ params }: PageProps<"/reservation/confirmation/[id]">) {
  await connection();
  const { id } = await params;
  const booking = await getPublicBooking(id);
  if (!booking) notFound();

  const text = STATUS_TEXT[booking.status];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-32 pb-24">
        <div className="mx-auto max-w-xl px-5 sm:px-6">
          <section className="rounded-sm bg-white p-6 text-center shadow-[0_20px_40px_-28px_rgba(60,40,20,0.35)] sm:p-10">
            <div
              className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${
                booking.status === "CANCELLED" ? "bg-cream-dark text-muted" : "bg-forest text-cream"
              }`}
              aria-hidden
            >
              {booking.status === "CANCELLED" ? (
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
