import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "@/components/Icons";
import { getI18n } from "@/i18n/server";

const SPA = "/images/auth-spa-still.jpg";

/** Right edge of the photo. Same curve for the clip and the gold stroke, in 0-1 space. */
const WAVE =
  "M0,0 L0.92,0 C0.99,0.2 0.8,0.36 0.93,0.52 C0.99,0.7 0.78,0.84 0.94,1 L0,1 Z";
const WAVE_EDGE =
  "M0.92,0 C0.99,0.2 0.8,0.36 0.93,0.52 C0.99,0.7 0.78,0.84 0.94,1";

export default async function AuthShell({
  current,
  children,
}: {
  current: string;
  children: React.ReactNode;
}) {
  const { t, href } = await getI18n();

  return (
    <div className="fixed inset-0 z-30 flex flex-col overflow-y-auto bg-ivory font-display lg:flex-row lg:overflow-hidden">
      <aside className="relative h-56 shrink-0 overflow-hidden sm:h-64 lg:h-auto lg:w-1/2 lg:overflow-visible">
        <svg width="0" height="0" className="absolute" aria-hidden>
          <defs>
            <clipPath id="auth-spa-wave" clipPathUnits="objectBoundingBox">
              <path d={WAVE} />
            </clipPath>
          </defs>
        </svg>

        <div className="absolute inset-0 lg:rtl:-scale-x-100">
          <div className="auth-spa-clip absolute inset-0">
            <Image
              src={SPA}
              alt={t.hero.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[46%_100%] lg:rtl:-scale-x-100"
            />
            <div className="absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-black/55 via-black/20 to-transparent lg:h-[52%]" />
          </div>
          <svg
            className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full lg:block"
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d={WAVE_EDGE} fill="none" stroke="#D6B878" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        <div className="relative z-10 flex h-full flex-col items-start p-5 sm:p-7 lg:max-w-[68%] lg:p-10 lg:pt-9">
          <Image
            src="/images/logo-mark.png"
            alt="Thai Prakhop Herbal Massage Studio"
            width={1024}
            height={1024}
            priority
            className="h-14 w-auto mix-blend-screen sm:h-16 lg:h-[4.75rem]"
          />
          <div className="mt-5 hidden max-w-[16rem] lg:block">
            <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-gold uppercase">{t.account.authTagline}</p>
            <p className="mt-3 text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] text-white">
              {t.hero.title1}
              <br />
              {t.hero.title2}
            </p>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-white/80">{t.hero.text}</p>
          </div>
        </div>
      </aside>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-ivory lg:overflow-y-auto">
        <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-6 sm:px-8 sm:py-8">
          <nav aria-label={t.nav.breadcrumb}>
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.78rem]">
              <li>
                <Link href={href("/")} className="font-medium text-forest transition hover:text-forest-dark">
                  {t.nav.home}
                </Link>
              </li>
              <li aria-hidden="true" className="text-sage">
                <ChevronRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
              </li>
              <li className="text-ink" aria-current="page">
                {current}
              </li>
            </ol>
          </nav>
          <div className="w-full py-5 lg:my-auto lg:py-4">{children}</div>
        </div>
      </div>
      <style>{`@media (min-width:1024px){.auth-spa-clip{clip-path:url(#auth-spa-wave)}}`}</style>
    </div>
  );
}
