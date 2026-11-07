import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import { ArrowRight } from "@/components/Icons";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import BookingFlow from "@/components/booking/BookingFlow";
import { pageMetadata } from "@/i18n/seo";
import { getI18n } from "@/i18n/server";
import { blurProps, images } from "@/lib/images";
import { getBookableDays } from "@/server/booking/calendar";
import { getActiveServices } from "@/server/booking/services";
import { getCustomerSession } from "@/server/customer/session";
import { usableVouchersForPhone } from "@/server/loyalty/engine";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getI18n();
  return pageMetadata(locale, "/reservation", t.meta.reservationTitle, t.meta.reservationDescription);
}

export default async function ReservationPage({ searchParams }: PageProps<"/reservation">) {
  await connection();
  const [{ service, duration }, services, days, { t }, session] = await Promise.all([
    searchParams,
    getActiveServices(),
    getBookableDays(),
    getI18n(),
    getCustomerSession(),
  ]);
  const vouchers = session ? await usableVouchersForPhone(session.phone) : [];
  const initialSlug = typeof service === "string" ? service : undefined;
  const initialDuration = typeof duration === "string" && /^\d{1,3}$/.test(duration) ? Number(duration) : undefined;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-ivory pb-16 font-display sm:pb-24">
        <section className="relative isolate overflow-hidden">
          <Image
            src={images.reservationHero}
            {...blurProps(images.reservationHero)}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover object-[70%_center] rtl:-scale-x-100"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ivory via-ivory/80 to-ivory/10 rtl:bg-gradient-to-l sm:via-ivory/55 sm:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-ivory to-transparent" />
          <div className="w-full px-5 pt-28 pb-16 sm:px-6 sm:pt-36 sm:pb-24 lg:px-8 lg:pb-28">
            <p className="text-[0.68rem] font-medium tracking-[0.22em] text-sage uppercase sm:tracking-[0.28em]">
              {t.reservation.eyebrow}
            </p>
            <h1 className="mt-3 max-w-xl text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] text-forest sm:text-[2.6rem] lg:text-[3.1rem]">
              {t.reservation.title}
            </h1>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-sage">{t.reservation.text}</p>
            <a
              href="#book"
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-6 text-[0.88rem] font-medium text-white transition hover:bg-forest-dark"
            >
              {t.reservation.start}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </a>
          </div>
        </section>

        <div className="w-full px-5 sm:px-6 lg:px-8">
          <BookingFlow
            services={services}
            days={days}
            initialServiceSlug={initialSlug}
            initialDuration={initialDuration}
            guest={session ? { name: session.name, phone: session.phone } : undefined}
            vouchers={vouchers}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
