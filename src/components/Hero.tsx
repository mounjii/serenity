import Image from "next/image";
import Link from "next/link";
import { images } from "@/lib/images";

export default function Hero() {
  return (
    <section id="home" className="relative flex h-svh min-h-[640px] items-center overflow-hidden">
      <Image
        src={images.hero}
        alt="Spa treatment room with a massage table, rolled towels and candles"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[65%_center]"
      />
      <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-cream/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-cream to-transparent" />

      <div className="relative mx-auto w-full max-w-7xl px-6 pt-28 pb-20 lg:px-12">
        <div className="max-w-2xl">
          <p className="eyebrow">
            Relax <span className="mx-2">•</span> Recharge <span className="mx-2">•</span> Reconnect
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-[1.05] font-normal text-ink sm:text-6xl lg:text-[4.6rem]">
            More Than a Massage,
            <br />
            It&rsquo;s a Reset
          </h1>
          <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed font-light text-ink-soft">
            Escape the everyday and give your body and mind the care they deserve.
          </p>
          <Link
            href="#contact"
            className="mt-9 inline-block rounded-full bg-ink px-8 py-3.5 text-[0.8rem] tracking-wide text-cream transition hover:-translate-y-0.5 hover:bg-black hover:shadow-lg"
          >
            Book Your Session
          </Link>
        </div>
      </div>
    </section>
  );
}
