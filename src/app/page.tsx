import type { Metadata } from "next";
import { connection } from "next/server";
import IntroSplash from "@/components/IntroSplash";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import PublicOffer from "@/components/PublicOffer";
import About from "@/components/About";
import Treatments from "@/components/Treatments";
import ReviewSection from "@/components/ReviewSection";
import BookingCTA from "@/components/BookingCTA";
import Gallery from "@/components/Gallery";
import Reels from "@/components/Reels";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MobileBookBar from "@/components/MobileBookBar";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import BusinessJsonLd from "@/components/BusinessJsonLd";
import { pageMetadata } from "@/i18n/seo";
import { getI18n } from "@/i18n/server";
import { salonPhone, whatsappLink } from "@/lib/phone";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getI18n();
  return pageMetadata(locale, "/", t.meta.title, t.meta.description);
}

export default async function Home() {
  await connection();
  const { t } = await getI18n();
  const phone = salonPhone();
  const whatsappHref = phone ? whatsappLink(phone, t.contact.bookMessage) : null;

  return (
    <>
      <BusinessJsonLd />
      <IntroSplash />
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <PublicOffer />
        <About />
        <Treatments />
        <ReviewSection />
        <BookingCTA />
        <Gallery />
        <Reels />
        <Contact />
      </main>
      <Footer />
      <MobileBookBar whatsappHref={whatsappHref} />
      <WhatsAppFloat />
    </>
  );
}
