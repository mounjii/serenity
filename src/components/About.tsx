import Image from "next/image";
import Link from "next/link";
import { images } from "@/lib/images";
import { ArrowRight } from "./Icons";
import Reveal from "./Reveal";

export default function About() {
  return (
    <section id="about" className="bg-cream-dark/60">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 md:grid-cols-2 lg:gap-24 lg:px-12 lg:py-28">
        <Reveal className="relative aspect-[5/4] overflow-hidden rounded-sm shadow-[0_30px_60px_-30px_rgba(60,40,20,0.35)]">
          <Image
            src={images.about}
            alt="Rolled towels and candles"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1.5s] hover:scale-105"
          />
        </Reveal>

        <Reveal delay={150} className="max-w-md">
          <p className="eyebrow">About Us</p>
          <h2 className="mt-4 font-serif text-5xl leading-[1.05] text-ink lg:text-[3.4rem]">
            Your Wellness
            <br />
            Is Our Priority
          </h2>
          <p className="mt-7 text-[0.92rem] leading-[1.85] font-light text-ink-soft">
            At Touch Sense, we believe that true well-being comes from balance. Our
            mission is to provide a peaceful space where you can relax, recharge
            and reconnect with yourself through the power of touch.
          </p>
          <Link
            href="#services"
            className="group mt-9 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3 text-[0.8rem] tracking-wide text-cream transition hover:bg-black"
          >
            Learn More
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
