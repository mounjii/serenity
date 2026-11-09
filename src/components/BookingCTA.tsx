import Image from "next/image";
import Link from "next/link";
import { getI18n } from "@/i18n/server";
import { blurProps, images } from "@/lib/images";
import { RESERVATION_PATH } from "@/lib/navigation";
import Parallax from "./Parallax";
import Reveal from "./Reveal";

export default async function BookingCTA() {
  const { t, href } = await getI18n();
  return (
    <section id="book" className="relative overflow-hidden bg-forest">
      <Parallax speed={0.06}>
        <Image src={images.cta} {...blurProps(images.cta)} alt="" fill sizes="100vw" className="object-cover" />
      </Parallax>
      <div className="absolute inset-0 bg-forest/40" />

      <div className="relative mx-auto max-w-3xl px-5 py-20 text-center font-display sm:px-6 sm:py-24 lg:py-28">
        <Reveal>
          <p className="text-[0.68rem] font-medium tracking-[0.22em] text-cream/70 uppercase sm:tracking-[0.28em]">
            {t.cta.eyebrow}
          </p>
        </Reveal>
        <Reveal delay={110}>
          <h2 className="mt-4 text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-cream sm:text-5xl lg:text-[3.4rem]">
            {t.cta.title}
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-cream/80">{t.cta.text}</p>
        </Reveal>
        <Reveal delay={280}>
          <Link
            href={href(RESERVATION_PATH)}
            className="mt-8 inline-flex min-h-12 items-center rounded-full bg-cream px-9 text-[0.88rem] font-medium text-ink transition hover:-translate-y-0.5 hover:bg-white sm:mt-9"
          >
            {t.cta.button}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
