import Image from "next/image";
import { getI18n } from "@/i18n/server";
import { blurProps, images } from "@/lib/images";
import { ArrowRight } from "./Icons";

export default async function Gallery() {
  const { t } = await getI18n();
  return (
    <section id="gallery" className="bg-ivory">
      <div className="w-full px-5 py-16 font-display sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-medium tracking-[0.22em] text-sage uppercase sm:tracking-[0.28em]">
              {t.gallery.eyebrow}
            </p>
            <h2 className="mt-3 text-[1.7rem] leading-[1.12] font-semibold tracking-[-0.03em] text-balance text-forest sm:text-[2.15rem] lg:text-[2.45rem]">
              {t.gallery.title}
            </h2>
          </div>
          <p className="mb-1 flex shrink-0 items-center gap-1.5 text-[0.72rem] tracking-[0.16em] text-sage uppercase sm:hidden">
            {t.gallery.swipe}
            <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
          </p>
        </div>
        <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-sage">{t.gallery.text}</p>

        <div className="no-scrollbar -me-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pe-5 pb-2 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pe-0 sm:pb-0">
          {images.gallery.map((src, i) => (
            <div
              key={src}
              className="group relative aspect-[3/4] w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl border border-black/[0.06] sm:w-auto"
            >
              <Image
                src={src}
                {...blurProps(src)}
                alt={t.gallery.alts[i] ?? t.gallery.fallbackAlt}
                fill
                sizes="(min-width: 640px) 25vw, 78vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
