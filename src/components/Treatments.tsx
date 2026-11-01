import Link from "next/link";
import { connection } from "next/server";
import { getI18n } from "@/i18n/server";
import { serviceText } from "@/i18n/services";
import { serviceImage } from "@/lib/images";
import { RESERVATION_PATH } from "@/lib/navigation";
import { ArrowRight } from "./Icons";
import { getActiveServices, type PublicService } from "@/server/booking/services";
import Reveal from "./Reveal";
import TreatmentCarousel from "./TreatmentCarousel";

const fallback = (slug: string, name: string, description: string, options: [number, number][]): PublicService => ({
  id: slug,
  slug,
  name,
  description,
  options: options.map(([durationMinutes, mad]) => ({ durationMinutes, priceCents: mad * 100 })),
});

/** Shown only if the database is unreachable; mirrors prisma/seed.ts. */
const fallbackServices: PublicService[] = [
  fallback("swedish-massage", "Swedish Massage", "A gentle, full-body massage that relieves stress and improves circulation.", [[60, 400], [90, 500], [120, 600]]),
  fallback("thai-oil-massage", "Thai Oil Massage", "A relaxing massage with natural oil to release tension and calm the mind.", [[60, 350], [90, 450], [120, 550]]),
  fallback("aroma-massage", "Aroma Massage", "A soothing massage with essential oils for deep relaxation.", [[60, 350], [90, 450], [120, 550]]),
  fallback("head-neck-shoulder-massage", "Head, Neck & Shoulder", "Focused work on the upper body to release stress, stiffness and headaches.", [[60, 300], [90, 450], [120, 550]]),
  fallback("thai-massage", "Thai Massage", "Traditional Thai technique that restores energy and flexibility.", [[60, 300], [90, 450], [120, 550]]),
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
  const [treatments, { t, href }] = await Promise.all([loadServices(), getI18n()]);
  const items = treatments.map((service) => {
    const { name, description } = serviceText(t, service);
    return {
      slug: service.slug,
      name,
      description,
      image: serviceImage(service.slug),
      href: href(`${RESERVATION_PATH}?service=${service.slug}`),
    };
  });

  return (
    <section id="services" className="bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">{t.treatments.eyebrow}</p>
            <h2 className="mt-3 font-serif text-[2.4rem] leading-[1.08] text-ink sm:text-5xl">{t.treatments.title}</h2>
          </div>
          <Link href={href(RESERVATION_PATH)} className="inline-flex items-center gap-2 text-[0.9rem] text-ink-soft transition hover:text-ink">
            {t.treatments.viewAll}
            <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </Reveal>

        <TreatmentCarousel items={items} prevLabel={t.testimonials.prev} nextLabel={t.testimonials.next} detailsAria={t.treatments.detailsAria} />
      </div>
    </section>
  );
}
