import Image from "next/image";
import Link from "next/link";
import { getI18n } from "@/i18n/server";
import { blurProps, images } from "@/lib/images";
import { RESERVATION_PATH } from "@/lib/navigation";
import { getGoogleRating } from "@/lib/google-reviews";
import { GOOGLE_REVIEW_URL } from "@/lib/site";
import { ArrowRight, GoogleIcon, PlayIcon, StarIcon } from "./Icons";
import Parallax from "./Parallax";

export default async function Hero() {
  const { t, href } = await getI18n();
  const google = await getGoogleRating();
  const reviewCount = (google.count === 1 ? t.testimonials.countOne : t.testimonials.count).replace(
    "{n}",
    String(google.count),
  );

  return (
    <section
      id="home"
      className="relative flex min-h-[100dvh] w-full min-w-0 flex-col overflow-hidden bg-white sm:block sm:bg-ivory"
    >
      <Parallax speed={0.12}>
        <Image
          src={images.hero}
          {...blurProps(images.hero)}
          alt={t.hero.imageAlt}
          fill
          priority
          sizes="(min-width: 640px) 100vw, 1px"
          className="hidden object-cover object-center sm:block rtl:-scale-x-100"
        />
      </Parallax>
      <div className="absolute inset-0 sm:hidden">
        <Image
          src={images.heroPhone}
          {...blurProps(images.heroPhone)}
          alt={t.hero.imageAlt}
          fill
          priority
          sizes="(max-width: 639px) 100vw, 1px"
          className="object-cover object-[72%_center] rtl:-scale-x-100"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,white_0%,white_16%,rgba(255,255,255,0.94)_32%,rgba(255,255,255,0.55)_48%,transparent_68%)]" />
      </div>
      <div className="absolute inset-0 hidden bg-gradient-to-t from-ivory via-ivory/30 to-transparent sm:block lg:hidden" />
      <div className="absolute inset-y-0 start-0 hidden w-[55%] bg-gradient-to-r from-ivory via-ivory/50 to-transparent rtl:bg-gradient-to-l md:block lg:w-[62%]" />

      <div className="relative mt-auto w-full min-w-0 px-5 pt-28 pb-8 sm:mt-0 sm:flex sm:min-h-[100dvh] sm:items-center sm:px-6 sm:pt-28 sm:pb-40 lg:px-8 lg:pb-44">
        <div className="w-full min-w-0 max-w-[44rem] font-display">
          <p className="text-[0.62rem] font-medium tracking-[0.16em] text-sage uppercase sm:text-[0.68rem] sm:tracking-[0.28em]">
            {t.hero.brand}
          </p>
          <h1 className="mt-3 max-w-full text-[clamp(1.5rem,6.8vw,1.85rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-ink sm:mt-4 sm:text-[clamp(1.85rem,4.2vw,3.35rem)] sm:leading-[1.08] sm:tracking-[-0.03em]">
            <span className="block whitespace-nowrap">{t.hero.title1}</span>
            <span className="block">{t.hero.title2}</span>
          </h1>
          <p className="mt-3 max-w-md text-[0.9rem] leading-relaxed text-sage sm:mt-5 sm:text-[1.02rem]">
            {t.hero.text}
          </p>
          <div className="mt-5 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <Link
              href={href(RESERVATION_PATH)}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-forest px-6 text-[0.9rem] font-medium text-white transition hover:bg-forest-dark sm:w-auto"
            >
              {t.hero.cta}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
            <Link
              href="#gallery"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full border border-forest/15 bg-white/80 px-5 text-[0.9rem] font-medium text-ink backdrop-blur-sm transition hover:border-forest/40 sm:w-auto"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-white">
                <PlayIcon className="h-3 w-3 translate-x-px rtl:-translate-x-px rtl:-scale-x-100" />
              </span>
              {t.hero.watch}
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-8">
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="inline-flex min-h-12 w-full items-center justify-center gap-1 whitespace-nowrap bg-transparent px-0 text-[0.72rem] text-sage sm:w-auto sm:gap-1.5 sm:px-5 sm:text-[0.9rem]"
            >
              <GoogleIcon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
              <span className="font-medium whitespace-nowrap text-ink">{t.testimonials.google}</span>
              <span className="h-3.5 w-px bg-black/15" aria-hidden />
              <span className="font-semibold text-ink">{google.rating.toFixed(1)}</span>
              <span className="flex gap-0.5" aria-hidden>
                {Array.from({ length: 5 }, (_, star) => (
                  <StarIcon
                    key={star}
                    className={star < Math.round(google.rating) ? "h-3 w-3 text-[#F5C400] sm:h-3.5 sm:w-3.5" : "h-3 w-3 text-[#F5C400]/30 sm:h-3.5 sm:w-3.5"}
                  />
                ))}
              </span>
              <span className="whitespace-nowrap">{reviewCount}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
