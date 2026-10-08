import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { fmt } from "@/i18n/format";
import { getI18n } from "@/i18n/server";
import { serviceText } from "@/i18n/services";
import { blurProps, serviceImage } from "@/lib/images";
import { RESERVATION_PATH } from "@/lib/navigation";
import { formatDuration } from "@/lib/format";
import { ArrowRight } from "./Icons";
import { getActiveServices, type PublicService } from "@/server/booking/services";
import Reveal from "./Reveal";

const fallback = (slug: string, name: string, description: string, options: [number, number][]): PublicService => ({
  id: slug,
  slug,
  name,
  description,
  options: options.map(([durationMinutes, mad]) => ({ durationMinutes, priceCents: mad * 100 })),
});

/** Shown only if the database is unreachable; mirrors prisma/seed.ts. */
const fallbackServices: PublicService[] = [
  fallback("swedish-massage", "Swedish Massage", "Gentle, flowing strokes to relieve tension and promote deep relaxation.", [[60, 400], [90, 500], [120, 600]]),
  fallback("thai-oil-massage", "Thai Oil Massage", "Traditional Thai techniques with warm oil to loosen muscles and restore energy.", [[60, 350], [90, 450], [120, 550]]),
  fallback("aroma-massage", "Aroma Massage", "Soothing essential oils to calm your mind and balance your body.", [[60, 350], [90, 450], [120, 550]]),
  fallback("head-neck-shoulder-massage", "Head, Neck & Shoulder", "Focused work on the upper body to release stress, stiffness and headaches.", [[60, 300], [90, 450], [120, 550]]),
  fallback("thai-massage", "Thai Massage", "Assisted stretching and acupressure for flexibility, circulation and balance.", [[60, 300], [90, 450], [120, 550]]),
  fallback("sports-massage", "Sports Massage", "Deep, targeted pressure to ease muscle tension and speed up recovery.", [[60, 450], [90, 550], [120, 700]]),
  fallback("foot-reflexology", "Foot Reflexology", "Pressure on reflex points of the feet to relax the whole body.", [[30, 180], [60, 300], [90, 400]]),
  fallback("hot-herbal-compress", "Hot Herbal Compress", "Warm Thai herbal compresses to soothe sore muscles and deeply relax.", [[90, 600], [120, 700]]),
];

async function loadServices(): Promise<PublicService[]> {
  await connection();
  try {
    const services = await getActiveServices();
    return services.length > 0 ? services : fallbackServices;
  } catch (error) {
    console.error("[treatments] could not load services, using fallback list", error);
    return fallbackServices;
  }
}

export default async function Treatments() {
  const [treatments, { t, locale, href }] = await Promise.all([loadServices(), getI18n()]);

  return (
    <section id="services" className="bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-24 lg:px-12 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t.treatments.eyebrow}</p>
          <h2 className="mt-4 font-serif text-[2.4rem] leading-[1.08] text-ink sm:text-5xl lg:text-[3.2rem]">{t.treatments.title}</h2>
          <p className="mx-auto mt-4 max-w-md text-[0.9rem] leading-relaxed font-light text-ink-soft sm:mt-5">{t.treatments.text}</p>
        </Reveal>

        <p className="mt-9 flex items-center justify-between text-[0.68rem] tracking-[0.22em] text-muted uppercase sm:hidden" aria-hidden>
          <span>{fmt(t.treatments.count, { n: treatments.length })}</span>
          <span className="flex items-center gap-2">
            {t.treatments.swipe} <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
          </span>
        </p>

        <div className="no-scrollbar -mx-5 mt-4 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-8 sm:mx-0 sm:mt-16 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {treatments.map((service, i) => {
            const { name, description } = serviceText(t, service);
            return (
              <Reveal
                as="article"
                key={service.slug}
                delay={(i % 4) * 120}
                className="group relative flex w-[80%] shrink-0 snap-start flex-col overflow-hidden rounded-sm bg-white shadow-[0_20px_40px_-28px_rgba(60,40,20,0.35)] transition-shadow duration-500 hover:shadow-[0_30px_60px_-25px_rgba(60,40,20,0.4)] sm:w-auto"
              >
                <Link
                  href={href(`${RESERVATION_PATH}?service=${service.slug}`)}
                  aria-label={fmt(t.treatments.detailsAria, { name })}
                  className="absolute inset-0 z-10"
                />
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={serviceImage(service.slug)} {...blurProps(serviceImage(service.slug))}
                    alt={name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw"
                    className="object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="text-[0.95rem] font-normal text-ink">{name}</h3>
                  <p className="mt-3 flex-1 text-[0.8rem] leading-relaxed font-light text-muted">{description}</p>
                  <ul className="mt-5 flex flex-wrap gap-1.5" aria-label={t.treatments.durations}>
                    {service.options.map((o) => (
                      <li key={o.durationMinutes} className="rounded-full border border-sand px-2.5 py-0.5 text-[0.7rem] text-ink-soft">
                        {formatDuration(o.durationMinutes, locale)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 flex items-center gap-2 border-t border-sand pt-4 text-[0.7rem] tracking-[0.18em] text-ink uppercase transition-colors group-hover:text-olive">
                    {t.treatments.details}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
