import type { Metadata } from "next";
import { Great_Vibes } from "next/font/google";
import Image from "next/image";
import { connection } from "next/server";
import { ArrowDown } from "@/components/Icons";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingFlow from "@/components/booking/BookingFlow";
import { getI18n } from "@/i18n/server";
import { blurProps, images } from "@/lib/images";
import { getBookableDays } from "@/server/booking/calendar";
import { getActiveServices } from "@/server/booking/services";

const greatVibes = Great_Vibes({ variable: "--font-great-vibes", subsets: ["latin"], weight: "400" });

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.reservationTitle, description: t.meta.reservationDescription };
}

export default async function ReservationPage({ searchParams }: PageProps<"/reservation">) {
  await connection();
  const [{ service, duration }, services, days, { t }] = await Promise.all([searchParams, getActiveServices(), getBookableDays(), getI18n()]);
  const initialSlug = typeof service === "string" ? service : undefined;
  const initialDuration = typeof duration === "string" && /^\d{1,3}$/.test(duration) ? Number(duration) : undefined;

  return (
    <>
      <Navbar />
      <main className={`${greatVibes.variable} min-h-screen bg-cream pb-16 sm:pb-24`}>
        <section className="relative isolate overflow-hidden">
          <Image
            src={images.reservationHero} {...blurProps(images.reservationHero)}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover object-[70%_center] rtl:-scale-x-100"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cream via-cream/85 to-cream/10 rtl:bg-gradient-to-l sm:via-cream/60 sm:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-cream to-transparent" />
          <div className="mx-auto max-w-6xl px-5 pt-28 pb-14 sm:px-6 sm:pt-40 sm:pb-24 lg:pb-28">
            <p className="animate-fade-up flex items-center gap-3 text-[0.7rem] tracking-[0.32em] text-bronze uppercase">
              <span className="h-px w-8 bg-bronze/60" aria-hidden />
              {t.reservation.eyebrow}
            </p>
            <h1 className="animate-fade-up mt-4 max-w-md font-serif text-[2.7rem] leading-[1.05] text-ink [animation-delay:80ms] sm:mt-5 sm:text-6xl lg:text-7xl">
              {t.reservation.title}
            </h1>
            <p className="animate-fade-up mt-4 max-w-[18rem] text-[0.92rem] leading-relaxed font-light text-ink-soft [animation-delay:160ms] sm:mt-6 sm:max-w-sm sm:text-[0.95rem]">
              {t.reservation.text}
            </p>
            <a
              href="#book"
              className="animate-fade-up mt-6 inline-flex items-center gap-3 py-1 text-[0.7rem] tracking-[0.25em] text-ink uppercase [animation-delay:240ms] hover:text-olive sm:mt-8"
            >
              {t.reservation.start}
              <span className="grid h-8 w-8 place-items-center rounded-full border border-ink/25">
                <ArrowDown className="animate-scroll-cue h-3.5 w-3.5" />
              </span>
            </a>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-3 sm:px-6">
          <BookingFlow services={services} days={days} initialServiceSlug={initialSlug} initialDuration={initialDuration} />
        </div>
      </main>
      <Footer />
    </>
  );
}
