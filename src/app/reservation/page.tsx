import type { Metadata } from "next";
import { connection } from "next/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingFlow from "@/components/booking/BookingFlow";
import { getBookableDays } from "@/server/booking/calendar";
import { getActiveServices } from "@/server/booking/services";

export const metadata: Metadata = {
  title: "Book a massage — Serenity",
  description: "Choose your treatment, pick a time and confirm your reservation in a minute.",
};

export default async function ReservationPage({ searchParams }: PageProps<"/reservation">) {
  await connection();
  const [{ service }, services, days] = await Promise.all([searchParams, getActiveServices(), getBookableDays()]);
  const initialSlug = typeof service === "string" ? service : undefined;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-32 pb-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <header className="text-center">
            <p className="eyebrow">Reservation</p>
            <h1 className="mt-4 font-serif text-4xl text-ink sm:text-5xl">Book Your Massage</h1>
            <p className="mx-auto mt-4 max-w-md text-[0.9rem] leading-relaxed font-light text-ink-soft">
              Choose your treatment, pick a time that suits you and confirm in a minute.
            </p>
          </header>
          <BookingFlow services={services} days={days} initialServiceSlug={initialSlug} />
        </div>
      </main>
      <Footer />
    </>
  );
}
