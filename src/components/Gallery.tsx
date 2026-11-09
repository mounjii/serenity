import { getI18n } from "@/i18n/server";
import { images } from "@/lib/images";
import GalleryGrid, { type GalleryGroup } from "./GalleryGrid";
import Reveal from "./Reveal";

const GROUP_INDEXES = [
  { key: "rooms", indexes: [0, 1, 3] },
  { key: "atmosphere", indexes: [4, 5] },
  { key: "experience", indexes: [2] },
  { key: "details", indexes: [6, 7] },
] as const;

export default async function Gallery() {
  const { t } = await getI18n();
  const items = GROUP_INDEXES.flatMap((group) =>
    group.indexes.map((index) => ({
      src: images.gallery[index],
      alt: t.gallery.alts[index] ?? t.gallery.fallbackAlt,
      label: t.gallery.groups[group.key],
    })),
  );
  const groups: GalleryGroup[] = [{ title: "", items }];

  return (
    <section id="gallery" className="bg-mist">
      <div className="w-full px-5 py-16 font-display sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <Reveal>
          <p className="text-[0.68rem] font-medium tracking-[0.22em] text-sage uppercase sm:tracking-[0.28em]">{t.gallery.eyebrow}</p>
        </Reveal>
        <Reveal delay={110}>
          <h2 className="mt-3 max-w-xl text-[1.7rem] leading-[1.12] font-semibold tracking-[-0.03em] text-balance text-forest sm:text-[2.15rem] lg:text-[2.45rem]">
            {t.gallery.title}
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-sage">{t.gallery.text}</p>
        </Reveal>
        <GalleryGrid groups={groups} closeLabel={t.gallery.close} prevLabel={t.gallery.prev} nextLabel={t.gallery.next} swipeLabel={t.gallery.swipe} />
      </div>
    </section>
  );
}
