import Image from "next/image";
import Link from "next/link";
import { images } from "@/lib/images";
import { RESERVATION_PATH } from "@/lib/navigation";
import { ArrowDown } from "./Icons";
import Parallax from "./Parallax";

const stagger = (ms: number) => ({ animationDelay: `${ms}ms` });

export default function Hero() {
  return (
    <section id="home" className="relative flex h-svh min-h-[640px] items-center overflow-hidden">
      <Parallax speed={0.18}>
        <Image
          src={images.hero}
          alt="Spa treatment room with a massage table, rolled towels and candles"
          fill
          priority
          sizes="100vw"
          className="animate-hero-zoom object-cover object-[65%_center]"
        />
      </Parallax>
      <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-cream/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-cream to-transparent" />

      <div className="relative mx-auto w-full max-w-7xl px-6 pt-28 pb-20 lg:px-12">
        <div className="max-w-2xl">
          <p className="eyebrow animate-fade-up" style={stagger(150)}>
            Relax <span className="mx-2">•</span> Recharge <span className="mx-2">•</span> Reconnect
          </p>
          <h1
            className="animate-fade-up mt-5 font-serif text-5xl leading-[1.05] font-normal text-ink sm:text-6xl lg:text-[4.6rem]"
            style={stagger(300)}
          >
            More Than a Massage,
            <br />
            It&rsquo;s a Reset
          </h1>
          <p className="animate-fade-up mt-6 max-w-sm text-[0.95rem] leading-relaxed font-light text-ink-soft" style={stagger(480)}>
            Escape the everyday and give your body and mind the care they deserve.
          </p>
          <div className="animate-fade-up mt-9" style={stagger(640)}>
            <Link
              href={RESERVATION_PATH}
              className="inline-block rounded-full bg-ink px-8 py-3.5 text-[0.8rem] tracking-wide text-cream transition duration-500 hover:-translate-y-0.5 hover:bg-black hover:shadow-lg"
            >
              Book Your Session
            </Link>
          </div>
        </div>
      </div>

      <a
        href="#about"
        aria-label="Scroll to discover"
        className="animate-fade-up absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.62rem] tracking-[0.3em] text-ink-soft uppercase transition hover:text-ink sm:flex"
        style={stagger(1100)}
      >
        Scroll
        <ArrowDown className="animate-scroll-cue h-4 w-4" />
      </a>
    </section>
  );
}
