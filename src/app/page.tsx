import type { Metadata } from "next";
import IntroSplash from "@/components/IntroSplash";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import Treatments from "@/components/Treatments";
import Testimonials from "@/components/Testimonials";
import BookingCTA from "@/components/BookingCTA";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MobileBookBar from "@/components/MobileBookBar";
import BusinessJsonLd from "@/components/BusinessJsonLd";
import { pageMetadata } from "@/i18n/seo";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getI18n();
  return pageMetadata(locale, "/", t.meta.title, t.meta.description);
}

export default function Home() {
  return (
    <>
      <BusinessJsonLd />
      <IntroSplash />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <About />
        <Treatments />
        <Testimonials />
        <BookingCTA />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <MobileBookBar />
    </>
  );
}
