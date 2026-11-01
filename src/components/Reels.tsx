import { getI18n } from "@/i18n/server";
import { reels } from "@/lib/reels";
import { SOCIAL_LINKS } from "@/lib/site";
import ReelVideo from "./ReelVideo";
import Reveal from "./Reveal";

export default async function Reels() {
  if (reels.length === 0) return null;

  const { t } = await getI18n();
  return (
    <section id="reels" className="bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-24 lg:px-12 lg:py-28">
        <Reveal className="mx-auto max-w-md text-center">
          <p className="eyebrow">{t.reels.eyebrow}</p>
          <h2 className="mt-4 font-serif text-[2.4rem] leading-[1.08] text-ink sm:text-5xl lg:text-[3.2rem]">{t.reels.title}</h2>
          <p className="mx-auto mt-4 max-w-xs text-[0.88rem] leading-relaxed font-light text-ink-soft">{t.reels.text}</p>
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block text-[0.68rem] tracking-[0.2em] text-bronze uppercase underline-offset-8 hover:underline"
          >
            {t.reels.follow}
          </a>
        </Reveal>

        <p className="mt-8 text-end text-[0.7rem] tracking-[0.2em] text-muted uppercase sm:hidden">{t.reels.swipe}</p>
        <div className="no-scrollbar -mx-5 mt-3 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:mt-14 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:gap-6">
          {reels.map((reel, i) => (
            <Reveal
              key={reel.src}
              variant="zoom"
              delay={(i % 3) * 110}
              className="relative aspect-[9/16] w-[58%] shrink-0 snap-start overflow-hidden rounded-lg bg-ink/10 shadow-[0_16px_36px_-22px_rgba(60,40,20,0.28)] sm:w-auto"
            >
              <ReelVideo src={reel.src} poster={reel.poster} label={t.reels.clipLabel} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
