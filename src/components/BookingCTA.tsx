import Image from "next/image";
import Link from "next/link";
import { images } from "@/lib/images";
import Reveal from "./Reveal";

export default function BookingCTA() {
  return (
    <section id="contact" className="relative overflow-hidden bg-forest">
      <Image
        src={images.cta}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-forest/40" />

      <Reveal className="relative mx-auto max-w-3xl px-6 py-24 text-center lg:py-28">
        <p className="eyebrow !text-cream/60">Ready to Feel Better?</p>
        <h2 className="mt-4 font-serif text-4xl text-cream sm:text-5xl lg:text-[3.4rem]">
          Book Your Massage Today
        </h2>
        <p className="mt-4 text-[0.9rem] font-light text-cream/70">
          Take the first step towards a healthier, happier you.
        </p>
        <Link
          href="mailto:hello@serenity-spa.com"
          className="mt-9 inline-block rounded-full bg-cream px-8 py-3.5 text-[0.8rem] tracking-wide text-ink transition hover:-translate-y-0.5 hover:bg-white hover:shadow-xl"
        >
          Book Now
        </Link>
      </Reveal>
    </section>
  );
}
