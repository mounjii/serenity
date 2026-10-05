import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
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
  const treatments = await loadServices();

  return (
    <section id="services" className="bg-cream">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Our Services</p>
          <h2 className="mt-4 font-serif text-4xl text-ink sm:text-5xl lg:text-[3.2rem]">
            Massage & Wellness Treatments
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[0.9rem] leading-relaxed font-light text-ink-soft">
            Choose from our range of professional treatments designed to relax
            your body, calm your mind and restore your energy.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {treatments.map((t, i) => (
            <Reveal
              as="article"
              key={t.slug}
              delay={(i % 4) * 120}
              className="group relative flex flex-col overflow-hidden rounded-sm bg-white shadow-[0_20px_40px_-28px_rgba(60,40,20,0.35)] transition-shadow duration-500 hover:shadow-[0_30px_60px_-25px_rgba(60,40,20,0.4)]"
            >
              <Link
                href={`${RESERVATION_PATH}?service=${t.slug}`}
                aria-label={`${t.name}: details and prices`}
                className="absolute inset-0 z-10"
              />
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={serviceImage(t.slug)} {...blurProps(serviceImage(t.slug))}
                  alt={t.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-[0.95rem] font-normal text-ink">{t.name}</h3>
                <p className="mt-3 flex-1 text-[0.8rem] leading-relaxed font-light text-muted">
                  {t.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Durations">
                  {t.options.map((o) => (
                    <li key={o.durationMinutes} className="rounded-full border border-sand px-2.5 py-0.5 text-[0.7rem] text-ink-soft">
                      {formatDuration(o.durationMinutes)}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 flex items-center gap-2 border-t border-sand pt-4 text-[0.7rem] tracking-[0.18em] text-ink uppercase transition-colors group-hover:text-olive">
                  Details &amp; prices
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
