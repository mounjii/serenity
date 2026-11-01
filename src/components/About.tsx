import Image from "next/image";
import Link from "next/link";
import { getI18n } from "@/i18n/server";
import { blurProps, images } from "@/lib/images";
import { ArrowRight } from "./Icons";
import Reveal from "./Reveal";

export default async function About() {
  const { t } = await getI18n();
  return (
    <section id="about" className="bg-cream">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-16 sm:gap-12 sm:px-6 sm:py-20 md:grid-cols-2 lg:gap-16 lg:px-12 lg:py-24">
        <Reveal variant="curtain" className="relative aspect-[5/4] overflow-hidden rounded-2xl shadow-[0_24px_50px_-28px_rgba(60,40,20,0.35)]">
          <Image
            src={images.testimonial}
            {...blurProps(images.testimonial)}
            alt={t.testimonials.imageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </Reveal>

        <Reveal variant="right" delay={200} className="max-w-lg">
          <p className="eyebrow">{t.about.eyebrow}</p>
          <h2 className="mt-4 font-serif text-[2.5rem] leading-[1.05] text-ink sm:text-5xl lg:text-[3.25rem]">
            {t.about.title1}
            <br />
            {t.about.title2}.
          </h2>
          <p className="mt-5 text-[0.95rem] leading-[1.75] font-light text-ink-soft sm:mt-6">{t.about.text}</p>
          <Link
            href="#services"
            className="group mt-7 inline-flex min-h-12 items-center gap-2.5 rounded-full bg-ink px-7 text-[0.82rem] tracking-wide text-cream transition hover:bg-black sm:mt-8"
          >
            {t.about.cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
