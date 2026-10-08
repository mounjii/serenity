import Image from "next/image";
import Link from "next/link";
import { getI18n } from "@/i18n/server";
import { blurProps, images } from "@/lib/images";
import { RESERVATION_PATH } from "@/lib/navigation";
import { ArrowDown } from "./Icons";
import Parallax from "./Parallax";

const stagger = (ms: number) => ({ animationDelay: `${ms}ms` });

export default async function Hero() {
  const { t, href } = await getI18n();
  return (
    <section id="home" className="relative flex h-svh min-h-[640px] items-center overflow-hidden">
      <Parallax speed={0.18}>
        <Image
          src={images.hero} {...blurProps(images.hero)}
          alt={t.hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="animate-hero-zoom object-cover object-[65%_center] rtl:-scale-x-100"
        />
      </Parallax>
      <div className="absolute inset-y-0 start-0 hidden w-3/5 bg-gradient-to-r from-cream/45 to-transparent rtl:bg-gradient-to-l lg:block" />
      <div className="absolute inset-x-0 bottom-0 hidden h-6 bg-gradient-to-t from-cream to-transparent lg:block" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pt-24 pb-24 sm:px-6 sm:pt-28 sm:pb-20 lg:px-12">
        <div className="max-w-2xl">
          <p className="eyebrow animate-fade-up text-shade !text-cream lg:!text-muted" style={stagger(150)}>
            {t.hero.relax} <span className="mx-2">•</span> {t.hero.recharge} <span className="mx-2">•</span> {t.hero.reconnect}
          </p>
          <h1
            className="animate-fade-up mt-4 font-serif text-[2.9rem] leading-[1.02] text-shade font-normal text-cream sm:mt-5 lg:text-ink sm:text-6xl lg:text-[4.6rem]"
            style={stagger(300)}
          >
            {t.hero.title1}
            <br />
            {t.hero.title2}
          </h1>
          <p className="animate-fade-up mt-5 max-w-[19rem] text-shade text-[0.95rem] leading-relaxed text-cream sm:mt-6 lg:text-ink-soft sm:max-w-sm sm:font-light" style={stagger(480)}>
            {t.hero.text}
          </p>
          <div className="animate-fade-up mt-8 flex flex-wrap items-center gap-x-7 gap-y-4 sm:mt-9" style={stagger(640)}>
            <Link
              href={href(RESERVATION_PATH)}
              className="inline-flex min-h-12 items-center rounded-full bg-ink px-8 text-[0.85rem] tracking-wide text-cream shadow-[0_14px_28px_-16px_rgba(20,18,15,0.9)] transition duration-500 hover:-translate-y-0.5 hover:bg-black hover:shadow-lg sm:text-[0.8rem]"
            >
              {t.hero.cta}
            </Link>
            <Link href="#services" className="py-2 text-[0.72rem] tracking-[0.2em] text-ink uppercase underline-offset-8 hover:underline">
              {t.hero.treatments}
            </Link>
          </div>
        </div>
      </div>

      <a
        href="#about"
        aria-label={t.hero.scrollAria}
        className="animate-fade-up absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.62rem] tracking-[0.3em] text-ink-soft uppercase transition hover:text-ink sm:flex"
        style={stagger(1100)}
      >
        {t.hero.scroll}
        <ArrowDown className="animate-scroll-cue h-4 w-4" />
      </a>
    </section>
  );
}
