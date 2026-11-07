import { getI18n } from "@/i18n/server";
import { reels } from "@/lib/reels";
import { SOCIAL_LINKS } from "@/lib/site";
import { ArrowRight } from "./Icons";
import ReelVideo from "./ReelVideo";

export default async function Reels() {
  if (reels.length === 0) return null;

  const { t } = await getI18n();
  return (
    <section id="reels" className="bg-ivory">
      <div className="w-full px-5 py-16 font-display sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-medium tracking-[0.22em] text-sage uppercase sm:tracking-[0.28em]">
              {t.reels.eyebrow}
            </p>
            <h2 className="mt-3 text-[1.7rem] leading-[1.12] font-semibold tracking-[-0.03em] text-balance text-forest sm:text-[2.15rem] lg:text-[2.45rem]">
              {t.reels.title}
            </h2>
          </div>
          <p className="mb-1 flex shrink-0 items-center gap-1.5 text-[0.72rem] tracking-[0.16em] text-sage uppercase sm:hidden">
            {t.reels.swipe}
            <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
          </p>
        </div>
        <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-sage">{t.reels.text}</p>
        <a
          href={SOCIAL_LINKS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 text-[0.88rem] font-medium text-ink"
        >
          {t.reels.follow}
          <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
        </a>

        <div className="no-scrollbar -me-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pe-5 pb-2 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pe-0 sm:pb-0">
          {reels.map((reel) => (
            <div
              key={reel.src}
              className="relative aspect-[9/16] w-[70%] shrink-0 snap-start overflow-hidden rounded-2xl border border-black/[0.06] bg-sand sm:w-auto"
            >
              <ReelVideo src={reel.src} poster={reel.poster} label={t.reels.clipLabel} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
