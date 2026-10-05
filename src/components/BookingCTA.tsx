import Image from "next/image";
import Link from "next/link";
import { blurProps, images } from "@/lib/images";
import { RESERVATION_PATH } from "@/lib/navigation";
import Parallax from "./Parallax";
import Reveal from "./Reveal";

export default function BookingCTA() {
  return (
    <section id="book" className="relative overflow-hidden bg-forest">
      <Parallax speed={0.2}>
        <Image src={images.cta} {...blurProps(images.cta)} alt="" fill sizes="100vw" className="object-cover" />
      </Parallax>
      <div className="absolute inset-0 bg-forest/40" />

      <Reveal className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-6 sm:py-24 lg:py-28">
        <p className="eyebrow !text-cream/60">Ready to Feel Better?</p>
        <h2 className="mt-4 font-serif text-4xl text-cream sm:text-5xl lg:text-[3.4rem]">
          Book Your Massage Today
        </h2>
        <p className="mt-4 text-[0.9rem] font-light text-cream/70">
          Take the first step towards a healthier, happier you.
        </p>
        <Link
          href={RESERVATION_PATH}
          className="mt-8 inline-flex min-h-12 items-center rounded-full bg-cream px-9 text-[0.85rem] tracking-wide text-ink transition hover:-translate-y-0.5 hover:bg-white hover:shadow-xl sm:mt-9 sm:text-[0.8rem]"
        >
          Book Now
        </Link>
      </Reveal>
    </section>
  );
}
