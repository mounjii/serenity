import Image from "next/image";
import { getI18n } from "@/i18n/server";
import { blurProps, images } from "@/lib/images";
import Reveal from "./Reveal";

export default async function Gallery() {
  const { t } = await getI18n();
  return (
    <section id="gallery" className="bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-24 lg:px-12 lg:py-28">
        <Reveal className="mx-auto max-w-md text-center">
          <p className="eyebrow">{t.gallery.eyebrow}</p>
          <h2 className="mt-4 font-serif text-[2.4rem] leading-[1.08] text-ink sm:text-5xl lg:text-[3.2rem]">{t.gallery.title}</h2>
          <p className="mx-auto mt-4 max-w-xs text-[0.88rem] leading-relaxed font-light text-ink-soft">{t.gallery.text}</p>
        </Reveal>

        <p className="mt-8 text-end text-[0.7rem] tracking-[0.2em] text-muted uppercase sm:hidden">{t.gallery.swipe}</p>
        <div className="no-scrollbar -mx-5 mt-3 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:mt-14 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:gap-6">
          {images.gallery.map((src, i) => (
            <Reveal
              key={src}
              variant="zoom"
              delay={(i % 4) * 110}
              className="group relative aspect-[3/4] w-[72%] shrink-0 snap-start overflow-hidden rounded-sm sm:w-auto"
            >
              <Image
                src={src} {...blurProps(src)}
                alt={t.gallery.alts[i] ?? t.gallery.fallbackAlt}
                fill
                sizes="(min-width: 640px) 25vw, 72vw"
                className="object-cover transition-transform duration-[1.2s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/15" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
