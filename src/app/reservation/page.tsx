import type { Metadata } from "next";
import { Great_Vibes } from "next/font/google";
import Image from "next/image";
import { connection } from "next/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingFlow from "@/components/booking/BookingFlow";
import { images } from "@/lib/images";
import { getBookableDays } from "@/server/booking/calendar";
import { getActiveServices } from "@/server/booking/services";

const greatVibes = Great_Vibes({ variable: "--font-great-vibes", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Book a massage — Serenity",
  description: "Choose your treatment, pick a time and confirm your reservation in a minute.",
};

export default async function ReservationPage({ searchParams }: PageProps<"/reservation">) {
  await connection();
  const [{ service, duration }, services, days] = await Promise.all([searchParams, getActiveServices(), getBookableDays()]);
  const initialSlug = typeof service === "string" ? service : undefined;
  const initialDuration = typeof duration === "string" && /^\d{1,3}$/.test(duration) ? Number(duration) : undefined;

  return (
    <>
      <Navbar />
      <main className={`${greatVibes.variable} min-h-screen bg-cream pb-24`}>
        <section className="relative isolate overflow-hidden">
          <Image
            src={images.reservationHero}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover object-[70%_center]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cream via-cream/85 to-cream/10 sm:via-cream/60 sm:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-cream to-transparent" />
          <div className="mx-auto max-w-6xl px-5 pt-36 pb-20 sm:px-6 sm:pt-40 sm:pb-24 lg:pb-28">
            <p className="flex items-center gap-3 text-[0.7rem] tracking-[0.32em] text-bronze uppercase">
              <span className="h-px w-8 bg-bronze/60" aria-hidden />
              Reservation
            </p>
            <h1 className="mt-5 max-w-md font-serif text-5xl leading-[1.05] text-ink sm:text-6xl lg:text-7xl">Book Your Massage</h1>
            <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed font-light text-ink-soft">
              Choose your treatment, pick a time that suits you and confirm in a minute.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <BookingFlow services={services} days={days} initialServiceSlug={initialSlug} initialDuration={initialDuration} />
        </div>
      </main>
      <Footer />
    </>
  );
}
