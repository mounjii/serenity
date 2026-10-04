import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { images } from "@/lib/images";
import { RESERVATION_PATH } from "@/lib/navigation";
import { formatDuration, formatPrice } from "@/lib/format";
import { getActiveServices, type PublicService } from "@/server/booking/services";
import Reveal from "./Reveal";

const imageBySlug: Record<string, string> = {
  "swedish-massage": images.swedish,
  "deep-tissue-massage": images.deepTissue,
  "aromatherapy-massage": images.aromatherapy,
  "relaxation-massage": images.relaxation,
};

const fallbackServices: PublicService[] = [
  { id: "swedish-massage", slug: "swedish-massage", name: "Swedish Massage", description: "Gentle, flowing strokes to relieve tension and promote relaxation.", durationMinutes: 60, priceCents: 7000 },
  { id: "deep-tissue-massage", slug: "deep-tissue-massage", name: "Deep Tissue Massage", description: "Targeted pressure to release muscle tension and improve mobility.", durationMinutes: 60, priceCents: 8000 },
  { id: "aromatherapy-massage", slug: "aromatherapy-massage", name: "Aromatherapy Massage", description: "Essential oils to calm your mind and balance your energy.", durationMinutes: 60, priceCents: 7500 },
  { id: "relaxation-massage", slug: "relaxation-massage", name: "Relaxation Massage", description: "A full-body experience for deep relaxation and mental clarity.", durationMinutes: 60, priceCents: 6500 },
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
              delay={i * 120}
              className="group relative flex flex-col overflow-hidden rounded-sm bg-white shadow-[0_20px_40px_-28px_rgba(60,40,20,0.35)] transition-shadow duration-500 hover:shadow-[0_30px_60px_-25px_rgba(60,40,20,0.4)]"
            >
              <Link
                href={`${RESERVATION_PATH}?service=${t.slug}`}
                aria-label={`Book ${t.name}`}
                className="absolute inset-0 z-10"
              />
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={imageBySlug[t.slug] ?? images.gallery[0]}
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
                <div className="mt-6 flex items-center gap-3 border-t border-sand pt-4 text-[0.78rem] text-ink-soft">
                  <span>{formatDuration(t.durationMinutes)}</span>
                  <span className="h-3 w-px bg-sand" />
                  <span className="text-ink">{formatPrice(t.priceCents)}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
