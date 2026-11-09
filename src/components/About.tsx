import Image from "next/image";
import Link from "next/link";
import { getI18n } from "@/i18n/server";
import { blurProps, images } from "@/lib/images";
import { ArrowRight } from "./Icons";
import Parallax from "./Parallax";
import Reveal from "./Reveal";

export default async function About() {
  const { t } = await getI18n();
  return (
    <section id="about" className="bg-ivory">
      <div className="grid w-full items-center gap-10 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.9fr] lg:gap-16 lg:px-8 lg:py-24">
        <Reveal variant="curtain" className="relative aspect-[16/11] overflow-hidden rounded-2xl shadow-[0_24px_50px_-34px_rgba(23,23,23,0.45)]">
          <Parallax speed={0.05}>
            <Image
              src={images.about}
              {...blurProps(images.about)}
              alt={t.about.imageAlt}
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
          </Parallax>
        </Reveal>
        <div className="max-w-md font-display">
          <Reveal>
            <p className="text-[0.68rem] font-medium tracking-[0.28em] text-sage uppercase">{t.about.eyebrow}</p>
          </Reveal>
          <Reveal delay={110}>
            <h2 className="mt-4 text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] text-forest sm:text-[2.4rem] lg:text-[2.7rem]">
              {t.about.title1}
              <br />
              {t.about.title2}
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-sage">{t.about.text}</p>
          </Reveal>
          <Reveal delay={280}>
            <Link
              href="#services"
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-6 text-[0.88rem] font-medium text-white transition hover:bg-forest-dark"
            >
              {t.about.cta}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
