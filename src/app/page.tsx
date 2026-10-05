import IntroSplash from "@/components/IntroSplash";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import Treatments from "@/components/Treatments";
import Testimonials from "@/components/Testimonials";
import BookingCTA from "@/components/BookingCTA";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import MobileBookBar from "@/components/MobileBookBar";

export default function Home() {
  return (
    <>
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
      </main>
      <Footer />
      <MobileBookBar />
    </>
  );
}
